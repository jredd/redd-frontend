import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'section',
  classNameBindings: ['editing'],
  classNames: ['project_snippet', 'column'],
  editing: false,
  actions: {
    edit() {
      console.log('lets edit this shit');
    },
    details() {
      console.log('lets look at the details');
    },
    submit() {
      console.log('submit project');
    },
    delete() {
      console.log('delete this shit');
    }
  }
});
