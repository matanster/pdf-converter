// Generated by CoffeeScript 1.6.3
var exec, fDescriptorsCheckInterval, formerFD, formerMem, laterFD, laterMem, logging, memCheckInterval, percentThreshold;

logging = require('./util/logging');

exec = require("child_process").exec;

formerMem = null;

laterMem = null;

formerFD = null;

laterFD = null;

percentThreshold = 10;

memCheckInterval = 1000;

fDescriptorsCheckInterval = 10000;

exports.start = function(node) {
  var fileDescriptorsTracking, getFileDescriptorsCount, getMem, logFileDescriptorsCountIfChanged, logHeapSize, logMemUsage, logMemUsageIfChanged, memTracking;
  getMem = function() {
    var mem;
    mem = process.memoryUsage();
    mem.heapPercent = mem.heapUsed / mem.heapTotal * 100;
    return mem;
  };
  logMemUsage = function(mem, verb) {
    return logging.logPerf('Cluster ' + node + ' v8 heap usage ' + verb + ' ' + parseInt(mem.heapUsed / 1024 / 1024) + 'MB' + ' ' + '(now comprising ' + parseInt(mem.heapPercent) + '% of heap)');
  };
  logHeapSize = function(mem, verb) {
    return logging.logPerf('Cluster ' + node + ' v8 heap ' + verb + ' ' + parseInt(mem.heapTotal / 1024 / 1024) + 'MB');
  };
  logMemUsageIfChanged = function() {
    laterMem = getMem();
    if ((Math.abs(laterMem.heapTotal - formerMem.heapTotal) / formerMem.heapTotal) > (percentThreshold / 100)) {
      if (laterMem.heapTotal > formerMem.heapTotal) {
        logHeapSize(laterMem, 'grew to');
      } else {
        logHeapSize(laterMem, 'shrank to');
      }
    }
    if ((Math.abs(laterMem.heapPercent - formerMem.heapPercent) / formerMem.heapPercent) > (percentThreshold / 100)) {
      if (laterMem.heapUsed > formerMem.heapUsed) {
        logMemUsage(laterMem, 'increased to');
      } else {
        logMemUsage(laterMem, 'decreased to');
      }
    }
    return formerMem = laterMem;
  };
  memTracking = function() {
    formerMem = getMem();
    logHeapSize(formerMem, 'is');
    logMemUsage(formerMem, 'is');
    return process.nextTick(function() {
      return setInterval(logMemUsageIfChanged, memCheckInterval);
    });
  };
  getFileDescriptorsCount = function(callback) {
    var execCommand;
    execCommand = "lsof -p " + process.pid + " | wc -l";
    return exec(execCommand, function(error, stdout, stderr) {
      if (error !== null) {
        console.warn('could not use lsof to determine number of file descriptors');
        return callback(null);
      } else {
        return callback(parseInt(stdout));
      }
    });
  };
  logFileDescriptorsCountIfChanged = function() {
    return getFileDescriptorsCount(function(count) {
      laterFD = count;
      if ((Math.abs(laterFD - formerFD) / formerFD) > (percentThreshold / 100)) {
        logging.logPerf("Cluster " + node + " is currently using " + laterFD + " file descriptors");
      }
      return formerFD = laterFD;
    });
  };
  fileDescriptorsTracking = function() {
    getFileDescriptorsCount(function(count) {
      return laterFD = count;
    });
    return process.nextTick(function() {
      return setInterval(logFileDescriptorsCountIfChanged, fDescriptorsCheckInterval);
    });
  };
  memTracking();
  return fileDescriptorsTracking();
};
