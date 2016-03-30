import DS from 'ember-data';
import Ember from 'ember';

//export default DS.JSONAPIAdapter.extend({
//  //namespace: 'api/v1',
//  headers: function() {
//    return {'Authorization': 'Token '+ this.get('session.data.authenticated.access_token')};
//  }
//});


//export default DS.RESTSerializer.extend({
export default DS.JSONAPIAdapter.extend({
  host: 'http://104.236.96.7',
  session: Ember.inject.service('session'),
  buildURL: function() {
    var normalURL = this._super.apply(this, arguments);
    var id = arguments[1];
    // Noraml url spits out messed up emails and django will auto redirect which breaks things
    var user_name = id.split('@')[0];
    var new_url = normalURL.split(user_name)[0] + id + '/';
    // Django adds '/' to urls if it doesn't have one. It will break CORS
    return new_url;
  },
  headers: Ember.computed('session.data.authenticated.access_token', function() {
    //console.log(this.get('session.data.authenticated.id'))
    return {
      'Authorization': 'Token '+ this.get('session.data.authenticated.access_token')
    };
  })
});
