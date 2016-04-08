import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'section',
  classNameBindings: ['editing'],
  classNames: ['project_snippet', 'column'],
  editing: false,
  actions: {

  }
});
