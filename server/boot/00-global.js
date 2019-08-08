
const _ = require('lodash');
const bluebird = require('bluebird');

module.exports = function (app) {
  _.assign(global, app.models);

  const variable = {};
  variable.Promise = bluebird;

  _.assign(global, variable);
};
