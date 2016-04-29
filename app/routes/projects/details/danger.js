import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var day = this.modelFor("project");
    console.log(this.modelFor('projects.details'));
    return day;
  },
  actions: {
    delete: function() {
      console.log('delete this shit')

      var controller = this.controller;
      console.log(this.modelFor('project'))
      //controller.get('project').destroyRecord().then(function() {
      //  controller.transitionToRoute('projects.index');
      //});
    }
  }
});
