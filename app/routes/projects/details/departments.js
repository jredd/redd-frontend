import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model() {
    //let project = this.modelFor('projects.details');
    //console.log(project.id)
    //let data = this.store.findAll('department');
    //this.store.queryRecord('person', { filter: { email: 'tomster@example.com' } }).then(function(tomster) {
    return this.modelFor('projects.details');
    //this.store.query('department', {filter: {project: project.id}}).then(function(data) {
    //  console.log(data);
    //});
    //console.log(data)
    //return data;
    //return this.store.findAll('department');
    //return this.store.findAll('project');
  }
});
