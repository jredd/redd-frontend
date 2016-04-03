import Ember from 'ember';

//const { service } = Ember.inject;


export default Ember.Controller.extend({
  session: Ember.inject.service('session'),

  actions: {
    invalidateSession() {
      this.get('session').invalidate();
    },
    transitionToLoginRoute() {
      this.transitionToRoute('login');
    },
    getSessionInfo() {
      console.log(this.get('session.isAuthenticated'));
      console.log(this.get('session.data.authenticated.token'));
    }
  }
});
