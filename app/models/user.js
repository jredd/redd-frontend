import DS from 'ember-data';
import Ember from 'ember';

const { attr } = DS;

export default DS.Model.extend({
  first_name: attr('string'),
  last_name: attr('string'),
  email: attr('string'),
  is_active: attr('boolean'),
  is_staff: attr('boolean'),
  date_joined: attr('date'),
  is_superuser: attr('boolean'),
  salary: attr('number'),
  wage: attr('number'),
  //'current_assignments',
  //'departments',
  //'projects',
  avatar: attr('string'),
  name: Ember.computed('first_name', 'last_name', function() {
    const first_name = this.get('first_name');
    const last_name = this.get('last_name');

    if (first_name || last_name == null){
      return `${this.get('first_name')} ${this.get('last_name')}`;
    }else {
      return null;
    }

  })
});
