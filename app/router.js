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
  });

  this.route('departments', function() {
    this.route('index', {path: '/'});
  });

  this.route('assets', function() {
    this.route('index', {path: '/'});
  });
});

export default Router;
