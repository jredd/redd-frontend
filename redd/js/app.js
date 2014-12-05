App = Ember.Application.create();

// Models

// Routes
App.Router.map(function() {
  this.resource('projects');
  this.resource('assets');
  this.resource('departments');
  this.resource('login');
});

App.ApplicationRoute = Ember.Route.extend({
  actions: {
    // create a global logout action
    logout: function() {
      console.log('hit the route')
      // get the sessions controller instance and reset it to then transition to the sessions route
      this.controllerFor('login').set('token', null)
      //this.controllerFor('login').reset();
      $.removeCookie('token', { expires:.25, path: '/' });
      //this.controllerFor('login').get();
      this.transitionTo('login');
    }
  }
});

App.AuthenticatedRoute = Ember.Route.extend({
  beforeModel: function(transition) {
    if (!this.controllerFor('login').get('token')) {
      this.redirect_to_login(transition)
    }
  },

  redirect_to_login: function(transition) {
    var loginController = this.controllerFor('login');
    loginController.set('attemptedTransition', transition);
    this.transitionTo('login');
  },

  get_json_with_token: function(url){
    var token = this.controllerFor('login').get('token');
    $.ajaxSetup({
      headers : {"AUTHORIZATION": "Token "+token}
    });

    return $.getJSON(url);
  },

  actions: {
    error: function(reason, transition) {
      if (reason.status === 401) {
        this.redirect_to_login(transition);
      }else{
        alert('something went wrong');
      }
    }
  }
});

App.ProjectsRoute = App.AuthenticatedRoute.extend({
  model: function() {
    return this.get_json_with_token('http://127.0.0.1:8000/core/project-list/');
  }
});

App.DepartmentsRoute = App.AuthenticatedRoute.extend({
  model: function() {
    return this.get_json_with_token('http://127.0.0.1:8000/core/department-list/');
  }
});

App.AssetsRoute = App.AuthenticatedRoute.extend({
  model: function() {
    return this.get_json_with_token('http://127.0.0.1:8000/tracker/asset-list/');
  }
});

App.LoginRoute = Ember.Route.extend({
  setupController: function(controller, context) {
    controller.reset();
  }
});

App.IndexRoute = App.AuthenticatedRoute.extend();



App.ProjectsController = Ember.Controller.extend({
});

App.LoginController = Ember.Controller.extend({
  login_failed: false,
  isProcessing: false,
  is_slow_connection: false,
  error_message: null,
  timeout: null,

  token: $.cookie('token'),
  token_changed: function() {
    //localStorage.token = this.get('token');
    console.log('token changed', this.get('token'))
    $.cookie('token', this.get('token'), { expires:.25, path: '/' });

    //$.cookie('token', this.get('token'), {expires:.1, path: '/'});
  }.observes('token'),

  actions: {
    login: function() {

      this.setProperties({
        login_failed: false,
        isProcessing: true
      });
      // Gather and post the authentication information
      var data = this.getProperties('username', 'password');
      this.set("timeout", setTimeout(this.slowConnection.bind(this), 5000));
      var request = Ember.$.post('http://127.0.0.1:8000/api-token-auth/', data);
      request.then(this.success.bind(this), this.failure.bind(this));
    }
  },
  success: function(response) {
    //console.log('shit was successful', response);
    this.reset();
    this.set('token', response.token);

    // Check to see if redirected from different route
    var attemptedTransition = this.get('attemptedTransition');
    if (attemptedTransition) {
      attemptedTransition.retry();
      this.set('attemptedTransition', null)
    }else {
      // Redirect to 'articles' by default
      this.transitionToRoute('projects')
    }
  },

  failure: function(response) {
    this.reset();
    // Detect the error type and response with appropriate message
    console.log(response)
    if (response.status === 400){
      this.set("error_message", 'Invalid username or password.');
    }else if (response.status === 0){
      this.set("error_message", 'Failed connecting to the server.');
    }else {
      this.set("error_message", 'Some kind of error occurred please try again later.');
    }
    this.set("login_failed", true);

  },

  slowConnection: function() {
    this.set("is_slow_connection", true);
  },

  reset: function() {
    clearTimeout(this.get("timeout"));
    this.setProperties({
      username: "",
      password: "",
      isProcessing: false,
      is_slow_connection: false
    })
  }
});
