import Ember from 'ember';
import CurrentUserInitializer from 'redd-frontend/initializers/current-user';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | current user', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  CurrentUserInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
