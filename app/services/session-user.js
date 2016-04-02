import Ember from 'ember';

const { inject: { service }, RSVP } = Ember;

export default Ember.Service.extend({

  session: service('session'),
  store: service(),

  loadCurrentUser() {
    return new RSVP.Promise((resolve, reject) => {
      const accountId = this.get('session.data.authenticated.id');
      if (!Ember.isEmpty(accountId)) {
        return this.get('store').findRecord('user', accountId).then((user) => {
          this.set('user', user);
          resolve();
          //}, reject);
          //}, reject);
        });
      } else {
        resolve();
      }
    });
  }
});
