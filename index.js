'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./formik.cjs.production.js');
} else {
  module.exports = require('./formik.cjs.development.js');
}