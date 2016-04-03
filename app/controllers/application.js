import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),

  actions: {
    transitionToLoginRoute() {
      this.transitionToRoute('login');
    },
    getSessionInfo() {
      console.log(this.get('session.isAuthenticated'));
      console.log(this.get('session.data.authenticated.token'));
    }
  }
});
