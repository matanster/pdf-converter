// Generated by CoffeeScript 1.6.3
var logging, riak, util;

util = require('./util');

logging = require('./logging');

riak = require('riak-js').getClient({
  host: "localhost",
  port: "8098"
});

exports.store = function(bucket, filename, file, docLogger) {
  var fileContent, fs;
  fs = require('fs');
  util.timelog("storing file to clustered storage");
  fileContent = fs.readFileSync(file);
  return riak.save(bucket, filename, fileContent, function(error) {
    util.timelog("storing file to clustered storage", docLogger);
    if (error != null) {
      return docLogger.error("failed storing file to clustered storage");
    }
  });
  /*
  riak.get('pdf', 'tXqIBGiBR5aMgxBQBOVY', (error, fileContent) ->
    if error
      logging.log(error)
    else
      logging.log(fileContent)
    fs.writeFileSync('back-from-riak.pdf', fileContent))
  */

};
