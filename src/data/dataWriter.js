// Generated by CoffeeScript 1.6.3
var docsDataDir, files, getReadyName, logging, myWriter, rdbms, rdbmsWrite, util;

myWriter = require('./writer');

logging = require('../util/logging');

util = require('../util/util');

rdbms = require('../storage/rdbms/rdbms');

exports.docsDataDir = docsDataDir = 'docData';

files = {};

exports.getReadyName = getReadyName = function(context, dataType) {
  var inputFileName;
  inputFileName = context.name;
  util.mkdir(docsDataDir, inputFileName);
  return docsDataDir + '/' + inputFileName + '/' + dataType + '@' + context.runID + '.out';
};

rdbmsWrite = function(context, dataType, data, cnsl) {
  return rdbms.write(context, dataType, data);
};

exports.write = function(context, dataType, data, cnsl) {
  var dataFile, dataSerialized, inputFileName, writer;
  inputFileName = context.name;
  rdbmsWrite(context, dataType, data, cnsl);
  if (typeof data === 'object') {
    dataSerialized = Object.keys(data).map(function(key) {
      return "" + key + ": " + data[key];
    }).join(', ');
    data = dataSerialized;
  }
  if (cnsl != null) {
    logging.logBlue(data);
  }
  if (files[inputFileName] == null) {
    files[inputFileName] = {};
    console.log("clickable data directory link: " + ("file://" + (process.cwd()) + "/" + docsDataDir + "/") + encodeURIComponent(inputFileName) + '/');
  }
  if (files[inputFileName][dataType] == null) {
    logging.cond("opening writer for " + dataType, 'dataWriter');
    dataFile = getReadyName(context, dataType);
    writer = new myWriter(dataFile);
    logging.cond("Data writing for [" + inputFileName + "], [" + dataType + "] is going to " + dataFile, 'dataWriter');
    files[inputFileName][dataType] = writer;
  }
  files[inputFileName][dataType].write(data);
  return true;
};

exports.close = function(inputFileName) {
  var writer;
  logging.cond("closing writers for " + inputFileName, 'dataWriter');
  for (writer in files[inputFileName]) {
    logging.cond("writer to close: " + writer, logging.cond);
    files[inputFileName][writer].close();
  }
  return delete files[inputFileName];
};
