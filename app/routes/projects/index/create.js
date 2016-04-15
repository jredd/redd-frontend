import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    create_project() {
      //this.transitionTo('projects.index');
      console.log('create project');
    },
    cancel() {
      this.transitionTo('projects.index');
      console.log('cancel create');
    }
  },
  users: ['bob', 'saggot']
});
