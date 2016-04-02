import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

const { service } = Ember.inject;


export default Ember.Route.extend(ApplicationRouteMixin, {
  sessionUser: service('session-user'),
  CurrentUser() {
    return this._loadCurrentUser();
  },
  beforeModel() {
    return this._loadCurrentUser();
  },
  sessionAuthenticated() {
    this._super(...arguments);
    this._loadCurrentUser().catch(() => this.get('session').invalidate());
  },
  _loadCurrentUser() {
    return this.get('sessionUser').loadCurrentUser();
  },
  aftermodel() {
    return this.store.findRecord('user', 1);
  }
  //aftermodel() {
  //  return this.store.peekRecord('user', 1);
  //}
});

