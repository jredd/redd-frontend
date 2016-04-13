import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('details-sub-asset', 'Integration | Component | details sub asset', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{details-sub-asset}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#details-sub-asset}}
      template block text
    {{/details-sub-asset}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
