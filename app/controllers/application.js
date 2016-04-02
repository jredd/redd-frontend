import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  currentUser: function() {
    return this.get('session.id');
  },
  actions: {
    invalidateSession() {
      this.get('session').invalidate();
    },
    transitionToLoginRoute() {
      this.transitionToRoute('login');
    },
    getSessionInfo() {
      console.log(this.get('session.isAuthenticated'));
      console.log(this.get('session.data.authenticated.access_token'));
    },
    //restore() {
    //  //let { identification, password } = this.getProperties('identification', 'password');
    //
    //  this.get('session').restore().catch((reason) => {
    //    console.log(reason);
    //    this.set('errorMessage', reason.error);
    //  });
    //}
  }
});
