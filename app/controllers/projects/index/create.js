import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  icon: '/assets/default_project_icon.jpg',
  managingUser: null,
  is_active: true,
  actions: {
    set_new_icon() {
      let { new_icon } = this.getProperties('new_icon');
      this.set('icon', new_icon);
    },
    setManagingUser(managingUser) {
      this.managingUser = managingUser;
    },
    createProject() {
      let { name, new_icon, is_active } = this.getProperties('name', 'new_icon', 'is_active');
      console.log('turtles');
      console.log(this.session);
      console.log(this.get('currentUser.content.id'));
      var project = this.store.createRecord('project', {
        name: name,
        is_active: is_active,
        created_by: this.get('currentUser.content'),
        managing_user: this.store.findRecord('user', this.managingUser),
        icon: new_icon
      });

      var self = this;

      function transitionToProject(project) {
        self.transitionToRoute('projects.details', project);
      }

      function failure(reason) {
        console.log(reason);
      }
      // Waits on the server to respond back with the created info
      // then goes to it's details page
      project.save().then(transitionToProject).catch(failure);
    }
  }
});
