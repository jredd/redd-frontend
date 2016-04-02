import Ember from 'ember';

const { service } = Ember.inject;

export default Ember.Controller.extend({
  session: service('session'),
  actions: {
    authenticate() {
      let { identification, password } = this.getProperties('identification', 'password');

      this.get('session').authenticate('authenticator:django', identification, password).catch((reason) => {
        console.log(reason);
        console.log(reason.non_field_errors[0]);
        reason = reason.non_field_errors[0]
        if ( reason === "Unable to login with provided credentials."){
          this.set('errorMessage', 'Invalid Username or Password');
        }else{
          this.set('errorMessage', 'Bad Request to server');
        }
      });
    }
  }
});
