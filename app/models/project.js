import DS from 'ember-data';

const { attr, belongsTo } = DS;

export default DS.Model.extend({
  name: attr('string'),
  date_created: attr('date'),
  is_active: attr('boolean'),
  created_by: belongsTo('user'),
  icon: attr('string')
  //current_client: attr('manytomany')
});
