// Generated by CoffeeScript 1.6.3
var util;

util = require("./util");

exports.store = function(bucket, filename, file) {
  var fileContent, fs, riak;
  fs = require('fs');
  util.timelog("storing file to clustered storage");
  riak = require('riak-js').getClient({
    host: "localhost",
    port: "8098"
  });
  fileContent = fs.readFileSync(file);
  return riak.save(bucket, filename, fileContent, function(error) {
    util.timelog("storing file to clustered storage");
    if (error != null) {
      console.error("failed storing file to clustered storage");
      return false;
    }
    return true;
  });
  /*
  riak.get('pdf', 'tXqIBGiBR5aMgxBQBOVY', (error, fileContent) ->
    if error
      console.log(error)
    else
      console.log(fileContent)
    fs.writeFileSync('back-from-riak.pdf', fileContent))
  */

};
