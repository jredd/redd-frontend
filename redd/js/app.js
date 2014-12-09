App = Ember.Application.create();



// Models
App.Project = DS.Model.extend({
  name: DS.attr('string'),
  date_created: DS.attr('date'),
  created_by: DS.attr('string'),
  is_active: DS.attr('boolean')
});

App.Department = DS.Model.extend({
  name: DS.attr('string'),
  date_created: DS.attr('date'),
  created_by: DS.attr('string'),
  is_active: DS.attr('boolean'),
  project: DS.hasMany('project', {async: true})
});

App.Asset = DS.Model.extend({
  name: DS.attr('string'),
  date_created: DS.attr('date'),
  created_by: DS.attr('string'),
  project: DS.belongsTo('project', {async: true}),
  current_department: DS.hasMany('department', {async: true})
});

// AUTHORIZATION HEADERS
App.AuthorizationAdapter = DS.RESTAdapter.extend({
  host: 'https://localhost:6080',
  headers: function(){
    return {'AUTHORIZATION': "Token "+ $.cookie('token')}
  }.property().volatile(),

  buildURL: function() {
    var normalURL = this._super.apply(this, arguments);
    // Django adds '/' to urls if it doesn't have one. It will break CORS
    return normalURL + '/';
  },
  updateRecord: function(store, type, record) {
    var get = Ember.get;
    var data = {};
    var model_type = type.typeKey;
    var serializer = store.serializerFor(model_type);

    serializer.serializeIntoHash(data, type, record);
    var id = get(record, 'id');
    // Send the root data without the models name back to django
    return this.ajax(this.buildURL(model_type, id, record), "PUT", { data: data[model_type] });
  },
  createRecord: function(store, type, record) {
    var data = {};
    var model_type = type.typeKey
    var serializer = store.serializerFor(model_type);

    serializer.serializeIntoHash(data, type, record, { includeId: true });

    return this.ajax(this.buildURL(model_type, null, record), "POST", { data: data[model_type] });
  },
  actions: {
    error: function(reason, transition) {

      if (reason.status === 401) {
        this.redirect_to_login(transition);
      }else{
        console.log(reason, transition)
        alert('something went wrong');
      }
    }
  }
});


// NAMESPACE ADAPTERS
App.CoreAdapter = App.AuthorizationAdapter.extend({
  namespace: 'core'
});
App.TrackerAdapter = App.AuthorizationAdapter.extend({
  namespace: 'tracker'
});
App.ProjectAdapter = App.CoreAdapter;
App.DepartmentAdapter = App.CoreAdapter;
App.AssetAdapter = App.TrackerAdapter;

// SERIALIZERS
App.ProjectSerializer = DS.RESTSerializer.extend({
  normalizePayload: function(payload) {
    return {project: payload};
  }
});
App.DepartmentSerializer = DS.RESTSerializer.extend({
  normalizePayload: function(payload) {
    return {department: payload};
  }
});
App.AssetSerializer = DS.RESTSerializer.extend({
  normalizePayload: function(payload) {
    return {asset: payload};
  }
});
// Routes
App.Router.map(function() {
  //this.resource('projects', function() {
  //  this.resource('create');
  //});
  this.resource('projects');
  this.resource('project', { path: '/project/:project_id'});
  this.resource('project-create', { path: 'projects/create'});
  this.resource('departments');
  this.resource('department', { path: '/department/:department_id'});
  this.route('department-create', { path: 'department/create'});
  this.route('assets');
  this.route('asset', { path: '/asset/:asset_id'});
  this.route('asset-create', { path: '/asset/create'});
  this.route('login');
});

App.ApplicationRoute = Ember.Route.extend({
  actions: {
    // create a global logout action
    logout: function() {
      // get the sessions controller instance and reset it to then transition to the sessions route
      this.controllerFor('login').set('token', null);
      $.removeCookie('token', { expires:.25, path: '/' });
      this.controllerFor('login').reset();
      this.controllerFor('login').set('user_name', null);
      $.removeCookie('user_name', { expires:.25, path: '/' });
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
  actions: {
    error: function(reason, transition) {

      if (reason.status === 401) {
        this.redirect_to_login(transition);
      }else{
        console.log(reason, transition)
        alert('something went wrong');
      }
    }
  }
});

App.ProjectsRoute = App.AuthenticatedRoute.extend({
  model: function() {
    return this.store.findAll('project').then(function(data) {
      return data;
    });
  }
});

App.ProjectRoute = App.AuthenticatedRoute.extend({
  model: function(params) {
    return this.store.find('project', params.project_id).then(function(data) {
      return data
    });
  }
});

App.ProjectCreateRoute = App.AuthenticatedRoute.extend({});

App.DepartmentsRoute = App.AuthenticatedRoute.extend({
  model: function() {
    return this.store.findAll('department').then(function(data) {
      return data
    });
  }
});

App.DepartmentRoute = App.AuthenticatedRoute.extend({
  model: function(params) {
    return this.store.find('department', params.department_id).then(function(data) {
      return data
    });
  }
});

App.AssetsRoute = App.AuthenticatedRoute.extend({
  model: function() {
    return this.store.findAll('asset').then(function(data) {
      return data
    });
  }

});

App.AssetRoute = App.AuthenticatedRoute.extend({
  model: function(params) {
    return this.store.find('asset', params.asset_id).then(function(data) {
      return data
    });
  }
});

App.AssetCreateRoute = App.AuthenticatedRoute.extend({
  model: function() {
    var new_asset = this.store.createRecord('asset')

    return this.store.createRecord('asset');
  },
  setupController: function(controller, model) {
    controller.set('department', this.store.findAll('department'));
    controller.set("model", model);
    controller.set('project', this.store.findAll('project'));
  }
});

App.LoginRoute = Ember.Route.extend({
  setupController: function(controller, context) {
    controller.reset();
  }
});
App.IndexRoute = App.AuthenticatedRoute.extend();

// CONTROLLERS
App.AssetsController = Ember.ArrayController.extend({
  total_assets: function() {
    return this.get('model.length');
  }.property('@each')
});

App.AssetController = Ember.ObjectController.extend({
  asset_creation_failed: false,
  error_message: null,
  is_editing: false,
  actions: {
    edit: function () {
      this.set('is_editing', true);
    },
    update: function () {
      this.get('model').save();
      this.set('is_editing', false)
    },
    delete_model: function () {
      var project = this.get('model')
      project.deleteRecord();
      project.save().then(function (resp) {
        this.transitionToRoute('assets');
      }.bind(this), function (resp) {
        if (resp.status === 400) {
          this.set("error_message", resp.responseText);
        } else {
          console.log(resp);
          alert('an error occured communicating with the server.')
        }
        this.set("asset_creation_failed", true);
      }.bind(this));
      this.set('is_editing', false)
    },
    cancel_edit: function () {
      this.get('model').rollback();
      this.set('is_editing', false)
    }
  }
});

App.AssetCreateController = Ember.ObjectController.extend({
  //username: this.controllerFor('login').get('user_name'),
  needs: ['login'],
  project: null,
  department: null,
  selected_project: null,
  actions: {
    create_asset: function() {
      this.set('created_by', this.get('controllers.login').get('user_name'));
      this.set('date_created', new Date());
      this.get('model').save().then(function(resp){
        console.log('success!', resp);
        this.transitionToRoute('assets');
      }.bind(this), function(resp){
        if (resp.status === 400){
          this.set("error_message", resp.responseText);
        }else {
          console.log(resp);
          alert('an error occurred communicating with the server.')
        }
        this.set("department_creation_failed", true);
      }.bind(this));
    }
  }
});

App.DepartmentsController = Ember.ArrayController.extend({
  total_departments: function() {
    return this.get('model.length');
  }.property('@each')
});

App.DepartmentController = Ember.ObjectController.extend({
  department_creation_failed: false,
  error_message: null,
  is_editing: false,
  actions: {
    edit: function () {
      this.set('is_editing', true);
    },
    update: function () {
      this.get('model').save();
      this.set('is_editing', false)
    },
    delete_model: function () {
      console.log('in delete')
      var project = this.get('model')
      project.deleteRecord();
      project.save().then(function (resp) {
        this.transitionToRoute('departments');
      }.bind(this), function (resp) {
        if (resp.status === 400) {
          this.set("error_message", resp.responseText);
        } else {
          console.log(resp);
          alert('an error occured communicating with the server.')
        }
        this.set("project_creation_failed", true);
      }.bind(this));
      this.set('is_editing', false)
    },
    cancel_edit: function () {
      this.get('model').rollback();
      this.set('is_editing', false)
    }
  }
});

App.DepartmentCreateController = Ember.ArrayController.extend({
  //username: this.controllerFor('login').get('user_name'),
  name: null,
  actions: {
    create_department: function() {
      var data = this.getProperties('name', 'is_active');
      data['created_by'] = this.controllerFor('login').get('user_name')
      data['date_created'] = new Date()
      //console.log(this.get('model').create())
      var department = this.store.createRecord('department', data);
      department.save().then(function(resp){
        console.log(resp)
        this.transitionTo('departments');
      }.bind(this), function(resp){
        if (resp.status === 400){
          this.set("error_message", resp.responseText);
        }else {
          console.log(resp);
          alert('an error occured communicating with the server.')
        }
        this.set("department_creation_failed", true);
      }.bind(this));
    }
  }
});

App.ProjectsController = Ember.ArrayController.extend({
  total_projects: function() {
    return this.get('model.length');
  }.property('@each')
});

App.ProjectController = Ember.ObjectController.extend({
  is_editing: false,
  actions: {
    edit: function() {
      this.set('is_editing', true);
    },
    update: function(){
      this.get('model').save();
      this.set('is_editing', false)
    },
    delete_model: function(){
      console.log('in delete')
      var project = this.get('model')
      project.deleteRecord();
      project.save().then(function(resp){
        this.transitionToRoute('projects');
      }.bind(this), function(resp){
        if (resp.status === 400){
          this.set("error_message", resp.responseText);
        }else {
          console.log(resp);
          alert('an error occured communicating with the server.')
        }
        this.set("project_creation_failed", true);
      }.bind(this));
      //this.set('is_editing', false)
    },
    cancel_edit: function() {
      this.get('model').rollback();
      this.set('is_editing', false)
    }
  }
});

App.ProjectCreateController = Ember.ArrayController.extend({
  //username: this.controllerFor('login').get('user_name'),
  project_creation_failed: false,
  error_message: null,
  name: null,
  is_active: false,

  actions: {
    create_project: function() {
      var data = this.getProperties('name', 'is_active');
      data['created_by'] = this.controllerFor('login').get('user_name')
      data['date_created'] = new Date()
      //console.log(this.get('model').create())
      var project = this.store.createRecord('project', data);
      project.save().then(function(resp){
        this.transitionTo('projects');
      }.bind(this), function(resp){
        if (resp.status === 400){
          this.set("error_message", resp.responseText);
        }else {
          console.log(resp);
          alert('an error occured communicating with the server.')
        }
        this.set("project_creation_failed", true);
      }.bind(this));
    }
  }
});

App.LoginController = Ember.Controller.extend({
  login_failed: false,
  isProcessing: false,
  is_slow_connection: false,
  error_message: null,
  timeout: null,

  token: $.cookie('token'),
  token_changed: function() {
    $.cookie('token', this.get('token'), { expires:.25, path: '/' });
  }.observes('token'),

  user_name: $.cookie('user_name'),
  user_name_changed: function() {
    $.cookie('user_name', this.get('user_name'), { expires:.25, path: '/' });
  }.observes('user_name'),

  actions: {
    login: function() {

      this.setProperties({
        login_failed: false,
        isProcessing: true
      });
      // Gather and post the authentication information
      this.set('user_name', this.get('username'));
      var data = this.getProperties('username', 'password');
      this.set("timeout", setTimeout(this.slowConnection.bind(this), 5000));

      //var request=$.getJSON('http://localhost:9080/api-token-auth/');
      var request = jQuery.post('https://localhost:6080/api-token-auth/', data);
      request.then(this.success.bind(this), this.failure.bind(this));
    }
  },

  success: function(response) {
    this.reset(),
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
    this.set("user_name", null)
    this.reset();
    console.log('shit broke')
    // Detect the error type and response with appropriate message
    console.log(response);
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

Ember.Handlebars.helper('format-date', function(date) {
  return moment(date).fromNow();
});