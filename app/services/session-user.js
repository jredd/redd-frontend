import Ember from 'ember';

const { inject: { service }, RSVP } = Ember;

export default Ember.Service.extend({

  session: service('session'),
  store: service(),

  loadCurrentUser() {
    return new RSVP.Promise((resolve, reject) => {
      const accountId = this.get('session.data.authenticated.id');
      if (!Ember.isEmpty(accountId)) {
        console.log(accountId)
        return this.get('store').find('user', accountId).then((user) => {
          this.set('user', user);
          console.log(user)
          resolve();
        });
        //}, reject);
      } else {
        resolve();
      }
    });
  }
});
