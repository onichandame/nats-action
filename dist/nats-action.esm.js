import { setFailed, info, getInput } from '@actions/core';
import { exec } from 'child_process';

var parsePorts = function parsePorts() {
  return getInput('port').split(' ').map(function (v) {
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
  exec(options.join(' '), function (e) {
    if (e) setFailed("failed to start server due to " + JSON.stringify(e));
  });
};

var ports = /*#__PURE__*/parsePorts();
if (!ports.length) setFailed("require at least 1 port");
info("ports " + ports.join(', ') + " will be used");

if (ports.length === 1) {
  startServer(ports[0]);
}
//# sourceMappingURL=nats-action.esm.js.map
