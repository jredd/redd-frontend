import Ember from 'ember';

export default Ember.Component.extend({
  session: Ember.inject.service('session'),
  tagName: 'nav',
  classNames: 'no-float',
  onInsert: function() {
    //var sub_navs = $('.nav_sub');
    //console.log(sub_nav.width());
    //sub_navs.each(function(i, d) {
    //var sub_nav = $(this);

    //console.log(sub_nav.parentNode())
    //var width = $(this).width();
    //console.log(width)
    //sub_nav.position().left(5);
    //sub_nav.css({width: '20px'})
    //});

  }.on('didInsertElement'),
  actions: {
    invalidateSession: function() {
      this.get('session').invalidate();
    }
  }
});
