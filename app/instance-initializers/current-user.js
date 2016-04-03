import Ember from 'ember';

export function initialize(/* application */) {
  // application.inject('route', 'foo', 'service:foo');
}

export default {
  name: 'current-user',
  initialize: function(application) {
    const service = Ember.ObjectProxy.create({ isServiceFactory: true });
    application.register('service:current-user', service, { instantiate: false, singleton: true });
    application.inject('route', 'currentUser', 'service:session-user');
    application.inject('controller', 'currentUser', 'service:session-user');
    application.inject('component', 'currentUser', 'service:session-user');
  }
};
