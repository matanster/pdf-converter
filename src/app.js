// Generated by CoffeeScript 1.6.3
'use strict';
var app, authorization, cluster, env, errorHandling, express, forkClusterWorkers, fs, host, http, localCluster, logging, nconf, numCPUs, path, port, primus, routes, selfMonitor, startServer;

fs = require('fs');

nconf = require('nconf');

nconf.argv().env().file({
  file: 'loggingConf.json'
});

nconf.defaults({
  host: 'localhost'
});

nconf.defaults({
  end: 'development'
});

express = require('express');

routes = require('../routes');

http = require('http');

path = require('path');

errorHandling = require('./errorHandling');

authorization = require('./authorization');

logging = require('./util/logging');

logging = require('./util/logging');

localCluster = nconf.get('localCluster');

host = nconf.get('host');

port = process.env.PORT || 3080;

env = nconf.get('env');

cluster = require('cluster');

numCPUs = require('os').cpus().length;

forkClusterWorkers = function() {
  var cpu, firstFork, workers, _i;
  workers = numCPUs;
  logging.logGreen("" + numCPUs + " CPUs detected on host");
  logging.logGreen("Spawning " + workers + " cluster workers...");
  firstFork = true;
  for (cpu = _i = 1; 1 <= workers ? _i <= workers : _i >= workers; cpu = 1 <= workers ? ++_i : --_i) {
    cluster.fork();
  }
  cluster.on('listening', function(worker, address) {
    var testFile, testUrl;
    logging.logGreen("Cluster worker " + worker.id + " now sharing on " + address.address + ":" + address.port + " (pid " + worker.process.pid + ")");
    if (env !== 'production') {
      testFile = 'gender differences 2013';
      if (firstFork) {
        firstFork = false;
        testUrl = 'http://localhost' + ':' + port + '/handleInputFile?localLocation=' + testFile;
        return http.get(testUrl, function(res) {
          return logging.logBlue('Cluster response to its own synthetic client is: ' + res.statusCode);
        });
      }
    }
  });
  return cluster.on('exit', function(worker, code, signal) {
    return logging.logRed("Cluster worker " + worker.id + " exited (pid " + worker.process.pid + ")");
  });
};

if (cluster.isMaster) {
  logging.logGreen("Local cluster starting in mode " + env);
  logging.logGreen('Using hostname ' + nconf.get('host'));
  logging.logGreen('Using port ' + port);
  forkClusterWorkers();
} else {
  logging.init();
  app = express();
  app.set('port', port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  if (env === 'production') {
    app.use(express.logger('default'));
  } else {
    app.use(express.logger('dev'));
  }
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('93AAAE3G205OI33'));
  app.use(express.session());
  app.use(app.router);
  app.use(express["static"](path.join(__dirname, 'public')));
  app.use(errorHandling.errorHandler);
  app.get('/handleInputFile', require('../src/core/handleInputFile').go);
  if (env !== 'production') {
    primus = require('./primus/primus');
  }
  startServer = function() {
    var server;
    server = http.createServer(app);
    server.timeout = 0;
    return server.listen(app.get('port'));
  };
  startServer();
}

selfMonitor = require('./selfMonitor').start();
