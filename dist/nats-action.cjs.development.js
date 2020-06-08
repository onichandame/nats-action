'use strict';

var core = require('@actions/core');
var child_process = require('child_process');

var parsePorts = function parsePorts() {
  return core.getInput('port').split(' ').map(function (v) {
    return parseInt(v);
  }).filter(function (v) {
    return !isNaN(v) && v >= 0;
  });
};

var startServer = function startServer(port, clusterPort, routePort, masterName) {
  var _options, _options2, _options3;

  var options = [];

  (_options = options).push.apply(_options, ['-d', '-p', port + ":" + port]);

  if (clusterPort) (_options2 = options).push.apply(_options2, ['--cluster', "nats://0.0.0.0:" + clusterPort]);
  if (routePort && masterName) (_options3 = options).push.apply(_options3, ['--routes', "nats://" + masterName + ":" + routePort]);
  options.push('nats');
  options = ['sudo', 'docker', 'run'].concat(options);
  child_process.exec(options.join(' '), function (e) {
    if (e) core.setFailed("failed to start server due to " + JSON.stringify(e));
  });
};

var ports = /*#__PURE__*/parsePorts();
if (!ports.length) core.setFailed("require at least 1 port");
core.info("ports " + ports.join(', ') + " will be used");

if (ports.length === 1) {
  startServer(ports[0]);
}
//# sourceMappingURL=nats-action.cjs.development.js.map
