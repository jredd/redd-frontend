import Ember from 'ember';

export function formatDate(date) {
  return moment(date[0]).fromNow();
}

export default Ember.Helper.helper(formatDate);
