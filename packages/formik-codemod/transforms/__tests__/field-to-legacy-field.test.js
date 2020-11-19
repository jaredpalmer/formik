/* global jest */
jest.autoMockOff();

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const fixtures = ['name-import'];

fixtures.forEach(test =>
  defineTest(
    __dirname,
    'field-to-legacy-field',
    null,
    `field-to-legacy-field/${test}`
  )
);
