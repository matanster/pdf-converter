// Generated by CoffeeScript 1.6.3
var aggregateWait, directory, filename, fs, host, http, httpCallBack, logging, nconf, requests, responses, util, _i, _len, _ref;

http = require('http');

fs = require('fs');

nconf = require('nconf');

util = require('../../util');

logging = require('../../logging');

nconf.argv().env();

nconf.defaults({
  host: "localhost"
});

host = nconf.get("host");

logging.logGreen('Running against host: ' + nconf.get('host') + '...');

logging.logGreen('');

http.globalAgent.maxSockets = 1000;

directory = '../local-copies/pdf/';

requests = 0;

responses = 0;

aggregateWait = 0;

util.timelog('Overall duration');

_ref = fs.readdirSync(directory);
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  filename = _ref[_i];
  if (fs.statSync(directory + filename).isFile()) {
    if (filename !== '.gitignore') {
      requests += 1;
      httpCallBack = (function(filename) {
        return function(res) {
          var requestElapsedTime;
          responses += 1;
          if (res.statusCode === 200) {
            logging.logGreen('Server response for ' + filename + ' is:   ' + res.statusCode);
          } else {
            logging.logYellow('Server response for ' + filename + ' is:   ' + res.statusCode);
          }
          console.log(responses + ' responses out of ' + requests + ' requests received thus far');
          requestElapsedTime = util.timelog('Server response for ' + filename);
          aggregateWait += requestElapsedTime / 1000;
          if (responses === requests) {
            util.timelog('Overall ');
            logging.logPerf('');
            logging.logPerf('-----------------------------');
            logging.logPerf('Aggregate response await time');
            logging.logPerf('time: ' + aggregateWait);
            logging.logPerf('normalized:' + (aggregateWait / responses));
            logging.logPerf('');
            process.exit(0);
          }
        };
      })(filename);
      console.log("Requesting " + directory + filename);
      util.timelog('Server response for ' + filename);
      http.get('http://' + host + '/handleInputFile?' + 'localLocation=' + filename, httpCallBack);
    } else {
      console.log('Skipping .gitignore');
    }
  } else {
    console.log('Skipping subdirectory ' + filename);
  }
}
