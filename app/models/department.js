import DS from 'ember-data';

const { attr, belongsTo, hasMany } = DS;


export default DS.Model.extend({
    name: attr('string'),
    date_created: attr('date'),
    is_active: attr('boolean'),
    created_by: belongsTo('user'),
    project: hasMany('project'),
    description: attr('string'),
    icon: attr('string')
});
