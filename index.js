'use strict'

if (__DEV__) {
  module.exports = require('./formik.cjs.development.js');
} else {
  module.exports = require('./formik.cjs.production.js');
}