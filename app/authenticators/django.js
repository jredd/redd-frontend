import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';

const { RSVP, isEmpty, run } = Ember;

export default Base.extend({

  clientId: null,
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
          console.log(data)
          this._refreshAccessToken(data['expires_in'], data['refresh_token']).then(resolve, reject);
        } else {
          reject();
        }
      } else {
        if (isEmpty(data['access_token'])) {
          reject();
        } else {
          this._scheduleAccessTokenRefresh(data['expires_in'], data['expires_at'], data['refresh_token']);
          this._scheduleAccessTokenRefresh(data['expires_in'], data['expires_at'], data['refresh_token']);
          resolve(data);
        }
      }
    });
  },
  authenticate(identification, password, scope = []) {
    //console.log(scope);
    return new RSVP.Promise((resolve, reject) => {
      const data                = { 'grant_type': 'password', email: identification, password };
      const serverTokenEndpoint = this.get('serverTokenEndpoint');
      const scopesString = Ember.makeArray(scope).join(' ');
      if (!Ember.isEmpty(scopesString)) {
        data.scope = scopesString;
        console.log(data);
      }
      this.makeRequest(serverTokenEndpoint, data).then((response) => {
        run(() => {
          const expiresAt = this._absolutizeExpirationTime();
          const expires_in = this._expiresInTime();
          console.log(response)
          this._scheduleAccessTokenRefresh(expires_in, expiresAt, response['token']);
          if (!isEmpty(expiresAt)) {
            response = Ember.merge(response, { 'expires_at': expiresAt });
          }

          resolve({access_token: response.token});
        });
      }, (xhr) => {
        run(null, reject, xhr.responseJSON || xhr.responseText);
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
        Ember.A(['access_token', 'refresh_token']).forEach((tokenType) => {
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
    const clientId = this.get('clientId');

    if (!isEmpty(clientId)) {
      const base64ClientId = window.btoa(clientId.concat(':'));
      Ember.merge(options, {
        headers: {
          Authorization: `Basic ${base64ClientId}`
        }
      });
    }
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
  _refreshAccessToken(expiresIn, refreshToken) {
    const data                = { 'grant_type': 'token', 'refresh_token': refreshToken };
    const serverRefreshTokenEndpoint = this.get('serverRefreshTokenEndpoint');
    return new RSVP.Promise((resolve, reject) => {
      this.makeRequest(serverRefreshTokenEndpoint, data).then((response) => {
        run(() => {
          expiresIn       = response['expires_in'] || expiresIn;
          refreshToken    = response['refresh_token'] || refreshToken;
          const expiresAt = this._absolutizeExpirationTime(expiresIn);
          const data      = Ember.merge(response, { 'expires_in': expiresIn, 'expires_at': expiresAt, 'refresh_token': refreshToken });
          this._scheduleAccessTokenRefresh(expiresIn, null, refreshToken);
          this.trigger('sessionDataUpdated', data);
          resolve(data);
        });
      }, (xhr, status, error) => {
        Ember.Logger.warn(`Access token could not be refreshed - server responded with ${error}.`);
        reject();
      });
    });
  },
  _absolutizeExpirationTime() {
    return new Date((new Date().getTime()) + (this.tokenExpiresIn + 60) * 1000).getTime();
  },
  _expiresInTime(expiresIn) {
      return new Date((new Date().getTime()) + (this.tokenExpiresIn + this.tokenExpireLeeway) * 1000).getTime();

  }
});
