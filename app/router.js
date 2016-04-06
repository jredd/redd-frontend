import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login');
  this.route('index', {path: '/'});

  this.route('projects', function(){
    this.route('index', {path: '/'});
    this.route('details', {path: '/:id'}, function() {
      this.route('departments', {path: '/departments'});
      this.route('assets', {path: '/assets'});
      this.route('users', {path: '/users'});
      this.route('danger', {path: '/danger'});
    });

  });

  this.route('departments', function() {
    this.route('index', {path: '/'});
  });

  this.route('assets', function() {
    this.route('index', {path: '/'});
  });
  this.route('department');
});

export default Router;
