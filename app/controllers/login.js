import Ember from 'ember';

const { service } = Ember.inject;

export default Ember.Controller.extend({
  session: service('session'),
  actions: {
    authenticate() {
      let { identification, password } = this.getProperties('identification', 'password');

      this.get('session').authenticate('authenticator:django', identification, password).catch((reason) => {
        console.log(reason);
        this.set('errorMessage', reason.error);
      });
    }
  }
});
