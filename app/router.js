import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login');
  this.route('index', {path: '/'});

  this.route('projects', function(){
    this.route('index', {path: '/'}, function(){
      this.route('create', {path: '/create'});
    });

    this.route('details', {path: '/:id'}, function() {
      this.route('departments', {path: '/departments'});
      this.route('assets', {path: '/assets'});
      this.route('users', {path: '/users'});
      this.route('danger', {path: '/danger'});
    });

  });

  this.route('departments', function() {
    this.route('index', {path: '/'});
    this.route('details', {path: '/:id'}, function(){
      this.route('projects', {path: '/projects'});
      this.route('tasks', {path: '/tasks'});
      this.route('assets', {path: '/assets'});
      this.route('users', {path: '/users'});
      this.route('danger', {path: '/danger'});
    });
  });

  this.route('assets', function() {
    this.route('index', {path: '/'});
    this.route('details', {path: '/:id'}, function(){
      this.route('sub-assets', {path: '/sub-assets'});
      this.route('tasks', {path: '/tasks'});
      this.route('assets', {path: '/assets'});
      this.route('users', {path: '/users'});
      this.route('danger', {path: '/danger'});
    });
  });

});

export default Router;
