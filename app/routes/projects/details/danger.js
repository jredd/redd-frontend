import Ember from 'ember';
import $ from 'jquery';

export default Ember.Route.extend({
  model: function() {
    return this.modelFor('projects.details');
  },
  actions: {
    delete: function() {
      var controller = this.controller;
      controller.get('model').destroyRecord().then(function() {
        console.log('account deleted');
        controller.transitionToRoute('projects.index');
      }, function(response) {
        console.log('Project NOT deleted');
        console.log(response);
      }
      );
    },
    cancel: function() {
      console.log($('#deleteModal').addClass('disabled'));
      console.log($('.black_overlay').addClass('disabled'));
    },
    toggleDeleteModal: function() {
      console.log('modal');
      console.log($('#deleteModal').removeClass('disabled'));
      console.log($('.black_overlay').removeClass('disabled'));

    },
    checkMatching: function(inputData) {
      console.log(inputData);
      var controller = this.controller;
      let projectName = controller.get('model').get('name');
      var deleteBtn = $('.delete_project');
      if (inputData === projectName) {
        console.log(deleteBtn.prop('disabled', false));
      } else {
        deleteBtn.prop('disabled', true);
      }

    }

  }
});
