import Ember from 'ember';

export default Ember.Component.extend({
  edit: false,
  actions: {
    edit: function() {
      this.toggleProperty('edit');
      console.log(this.get('edit'));
    }
  },
  stuff: ['turtles', 'apples', 'boats']
});
