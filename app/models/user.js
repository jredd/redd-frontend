import DS from 'ember-data';

const { attr } = DS;

export default DS.Model.extend({
  first_name: attr('string'),
  email: attr('string'),
  last_name: attr('string'),
  is_active: attr('boolean'),
  is_staff: attr('boolean'),
  date_joined: attr('date'),
  is_superuser: attr('boolean'),
  salary: attr('number'),
  wage: attr('number'),
  //'current_assignments',
  //'departments',
  //'projects',
  avatar: attr('string')
});
