import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';

const { RSVP, isEmpty, run } = Ember;

export default Base.extend({

  serverTokenEndpoint: 'http://104.236.96.7/api-token-auth/',
  serverRefreshTokenEndpoint: 'http://104.236.96.7/api-token-refresh/',
  serverTokenRevocationEndpoint: null,
  refreshAccessTokens: true,
  _refreshTokenTimeout: null,
  tokenExpiresIn: 300, // Five mins
  tokenExpireLeeway: 60, // leeway amount

  restore(data) {
    return new RSVP.Promise((resolve, reject) => {
      const now                 = (new Date()).getTime();
      const refreshAccessTokens = this.get('refreshAccessTokens');
      if (!isEmpty(data['expires_at']) && data['expires_at'] < now) {
        if (refreshAccessTokens) {
          this._refreshAccessToken(data['expires_in'], data['token']).then(resolve, reject);
        } else {
          reject();
        }
      } else {
        if (isEmpty(data['token'])) {
          reject();
        } else {
          this._scheduleAccessTokenRefresh(data['expires_in'], data['expires_at'], data['token']);
          resolve(data);
        }
      }
    });
  },
  authenticate(identification, password, scope = []) {
    return new RSVP.Promise((resolve, reject) => {
      const data                = { 'grant_type': 'password', email: identification, password };
      const serverTokenEndpoint = this.get('serverTokenEndpoint');
      const scopesString = Ember.makeArray(scope).join(' ');
      if (!Ember.isEmpty(scopesString)) {
        data.scope = scopesString;
      }
      this.makeRequest(serverTokenEndpoint, data).then((response) => {
        run(() => {
          const expiresAt = this._absolutizeExpirationTime();
          const expiresIn = this._expiresInTime();
          this.clientId = response.id;
          this._scheduleAccessTokenRefresh(expiresIn, expiresAt, response.token);

          var stored_token = {token: response.token, id: response.id};

          if (!isEmpty(expiresAt)) {
            stored_token = Ember.assign(stored_token, { expires_in: expiresAt, expires_at: expiresIn});
          }
          resolve(stored_token);
        });
      }, (xhr) => {
        console.log(xhr);
        run(null, reject, xhr.responseJSON || xhr.responseText);
        //run(null, reject, xhr.responseText);
      });
    });
  },
  invalidate: function(data) {
    const serverTokenRevocationEndpoint = this.get('serverTokenRevocationEndpoint');
    function success(resolve) {
      run.cancel(this._refreshTokenTimeout);
      delete this._refreshTokenTimeout;
      resolve();
    }
    return new RSVP.Promise((resolve) => {
      if (isEmpty(serverTokenRevocationEndpoint)) {
        success.apply(this, [resolve]);
      } else {
        const requests = [];
        Ember.A(['token', 'refresh_token']).forEach((tokenType) => {
          const token = data[tokenType];
          if (!isEmpty(token)) {
            requests.push(this.makeRequest(serverTokenRevocationEndpoint, {
              'token_type_hint': tokenType, token
            }));
          }
        });
        const succeed = () => {
          success.apply(this, [resolve]);
        };
        RSVP.all(requests).then(succeed, succeed);
      }
    });
  },
  makeRequest(url, data) {
    const options = {
      url,
      data,
      type:        'POST',
      dataType:    'json',
      contentType: 'application/x-www-form-urlencoded'
    };

    return Ember.$.ajax(options);
  },
  _scheduleAccessTokenRefresh(expiresIn, expiresAt, refreshToken) {
    const refreshAccessTokens = this.get('refreshAccessTokens');
    if (refreshAccessTokens) {
      const now = (new Date()).getTime();
      if (isEmpty(expiresAt) && !isEmpty(expiresIn)) {
        expiresAt = new Date(now + expiresIn * 1000).getTime();
      }
      const offset = (Math.floor(Math.random() * 5) + 5) * 1000;
      if (!isEmpty(refreshToken) && !isEmpty(expiresAt) && expiresAt > now - offset) {
        run.cancel(this._refreshTokenTimeout);
        delete this._refreshTokenTimeout;
        if (!Ember.testing) {
          this._refreshTokenTimeout = run.later(this, this._refreshAccessToken, expiresIn, refreshToken, expiresAt - now - offset);
        }
      }
    }
  },
  _refreshAccessToken(expiresIn, token) {
    const data                = { grant_type: 'refresh_token', token: token };
    const serverRefreshTokenEndpoint = this.get('serverRefreshTokenEndpoint');

    return new RSVP.Promise((resolve, reject) => {
      this.makeRequest(serverRefreshTokenEndpoint, data).then((response) => {
        run(() => {
          var refreshToken    = response['token'] || token;
          const expiresIn = this._expiresInTime();
          const expiresAt = this._absolutizeExpirationTime();
          const new_data      = Ember.assign(response, { 'expires_in': expiresIn, 'expires_at': expiresAt, 'token': refreshToken });
          this._scheduleAccessTokenRefresh(expiresIn, expiresAt, refreshToken);
          this.trigger('sessionDataUpdated', new_data);
          resolve(new_data);
        });
      }, (xhr, status, error) => {
        Ember.Logger.warn(`Access token could not be refreshed - server responded with ${error}.`);
        reject();
      });
    });
  },
  _absolutizeExpirationTime() {
    return new Date((new Date().getTime()) + this.tokenExpiresIn * 1000).getTime();
  },
  _expiresInTime() {
      return new Date((new Date().getTime()) + (this.tokenExpiresIn + this.tokenExpireLeeway) * 1000).getTime();

  }
});
