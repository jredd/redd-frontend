import DS from 'ember-data';

const { attr, belongsTo } = DS;

export default DS.Model.extend({
  name: attr('string'),
  date_created: attr('date'),
  last_modified: attr('date'),
  created_by: belongsTo('user'),
  check_out: attr('boolean'),
  project: belongsTo('project'),
  current_checked_out_user: belongsTo('user'),
  location: attr('string'),
  current_department: belongsTo('department')
  //'current_department',
});
