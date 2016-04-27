import Ember from 'ember';

export default Ember.Controller.extend({
  //users: Ember.String.w('shit poop nouw')
  //users: ['get', 'fucked', 'right', 'nouw']
  //users: function() {
  //  console.log(Ember.String.w('shit poop nouw'));
  //  return ['get', 'fucked', 'right', 'nouw'];
  //}
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
        //date_created: attr('date'),
        is_active: is_active,
        created_by: this.get('currentUser.content.id'),
        managing_user: this.managingUser,
        icon: new_icon
      });
      //console.log(this.get('currentUser.content.id'))
      //console.log(project)
      var self = this;

      function transitionToProject(project) {
        self.transitionToRoute('projects.detail', project);
      }

      function failure(reason) {
        console.log(reason);
      }

      project.save().then(transitionToProject).catch(failure);
    }
  }
  //new_icon: Ember.observer('icon_path', function() {
  //  console.log('icon_path');
  //})
});
