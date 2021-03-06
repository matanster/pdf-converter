// Generated by CoffeeScript 1.6.3
var append, closes, fs, logging, opens, requestCloses, writer;

fs = require('fs');

logging = require('../util/logging');

opens = 0;

closes = 0;

requestCloses = 0;

writer = module.exports = function(fileName) {
  var fd, self;
  self = this;
  this.fileName = fileName;
  this.writing = false;
  this.opened = false;
  this.pendingClose = false;
  this.dataQueue = [];
  /*
  fs.open(fileName, 'wx', (error, fd) ->
           unless error
             self.fd = fd
             self.opened = true 
             console.log """opened file #{fileName}"""
           else
             console.error """failed opening data writing file #{fileName}: #{error}"""
         )
  */

  fd = fs.openSync(fileName, 'wx');
  opens += 1;
  this.fd = fd;
  this.opened = true;
  return logging.cond("opened data file " + fileName, 'dataWriter');
};

writer.prototype._appendQueue = function() {
  var buff, self, toWrite;
  self = this;
  writer.prototype._writeDone = function() {
    if (self.dataQueue.length > 0) {
      return self._appendQueue();
    } else {
      self.writing = false;
      if (self.pendingClose) {
        closes += 1;
        fs.closeSync(self.fd);
        return logging.cond("closes " + closes + " : request closes " + requestCloses + " : opens " + opens, 'dataWriter');
      }
    }
  };
  toWrite = this.dataQueue.slice().join('');
  buff = new Buffer(toWrite);
  this.dataQueue = [];
  return fs.write(this.fd, buff, 0, buff.length, null, this._writeDone);
};

append = function(queue, data) {
  return queue.push(data + '\n');
};

writer.prototype.write = function(data) {
  if (this.pendingClose) {
    console.error("attempting to write to file " + this.fileName + " that is already pending closure");
    return;
  }
  if (!this.opened) {
    return append(this.dataQueue, data);
  } else {
    if (!this.writing) {
      this.writing = true;
      append(this.dataQueue, data);
      return this._appendQueue();
    } else {
      return append(this.dataQueue, data);
    }
  }
};

writer.prototype.close = function() {
  requestCloses += 1;
  if (!this.opened) {
    console.error("attempting to close file " + this.fileName + " that is not open");
    return;
  }
  switch (this.writing) {
    case false:
      closes += 1;
      fs.closeSync(this.fd);
      return logging.cond("data file closes " + closes + " : request closes " + requestCloses + " : opens " + opens, 'dataWriter');
    case true:
      return this.pendingClose = true;
  }
};
