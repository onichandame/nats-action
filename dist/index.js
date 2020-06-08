
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./nats-action.cjs.production.min.js')
} else {
  module.exports = require('./nats-action.cjs.development.js')
}
