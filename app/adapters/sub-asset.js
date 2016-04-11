import Ember from 'ember';
import DRFAdapter from './drf';

export default DRFAdapter.extend({
  host: 'http://104.236.96.7',
  namespace: 'assets',
  session: Ember.inject.service('session'),
  headers: Ember.computed('session.data.authenticated.access_token', function() {
    return {
      'Authorization': 'JWT '+ this.get('session.data.authenticated.token'),
      'Content-type': 'application/json'
    };
  })
});
