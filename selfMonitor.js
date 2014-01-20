// Generated by CoffeeScript 1.6.3
var former, getMem, interval, later, logHeapSize, logUsage, logUsageIfChanged, logging, percentThreshold;

logging = require('./logging');

former = null;

later = null;

percentThreshold = 10;

interval = 1000;

getMem = function() {
  var mem;
  mem = process.memoryUsage();
  mem.heapPercent = mem.heapUsed / mem.heapTotal * 100;
  return mem;
};

logUsage = function(mem, verb) {
  return logging.logPerf('v8 heap usage ' + verb + ' ' + parseInt(mem.heapUsed / 1024 / 1024) + 'MB' + ' ' + '(now comprising ' + parseInt(mem.heapPercent) + '% of heap)');
};

logHeapSize = function(mem, verb) {
  return logging.logPerf('v8 heap ' + verb + ' ' + parseInt(mem.heapTotal / 1024 / 1024) + 'MB');
};

logUsageIfChanged = function() {
  later = getMem();
  if ((Math.abs(later.heapTotal - former.heapTotal) / former.heapTotal) > (percentThreshold / 100)) {
    if (later.heapTotal > former.heapTotal) {
      logHeapSize(later, 'grew to');
    } else {
      logHeapSize(later, 'shrank to');
    }
  }
  if ((Math.abs(later.heapPercent - former.heapPercent) / former.heapPercent) > (percentThreshold / 100)) {
    if (later.heapUsed > former.heapUsed) {
      logUsage(later, 'increased to');
    } else {
      logUsage(later, 'decreased to');
    }
  }
  logging.logPerf('on interval');
  return former = later;
};

exports.start = function() {
  former = getMem();
  logHeapSize(former, 'is');
  logUsage(former, 'is');
  return process.nextTick(function() {
    return setInterval(logUsageIfChanged, interval);
  });
};
