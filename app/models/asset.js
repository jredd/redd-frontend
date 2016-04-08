import DS from 'ember-data';

const { attr, belongsTo } = DS;

export default DS.Model.extend({
  name: attr('string'),
  date_created: attr('date'),
  created_by: belongsTo('user'),
  project: belongsTo('project')
  //'current_department',
});
