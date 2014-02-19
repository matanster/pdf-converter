// Generated by CoffeeScript 1.6.3
var async, fs, loadFile, mkdirp, path, readdir, sort, uuid;

async = require("async");

fs = require("fs");

path = require("path");

uuid = require("node-uuid");

mkdirp = require("mkdirp");

module.exports = function(dir) {
  dir = dir || path.join(process.cwd(), "store");
  return {
    dir: dir,
    list: function(cb) {
      var action, self;
      self = this;
      action = function(err) {
        if (err) {
          return cb(err);
        }
        return readdir(dir, function(err, files) {
          var fileLoaders;
          if (err) {
            return cb(err);
          }
          files = files.filter(function(f) {
            return f.substr(-5) === ".json";
          });
          fileLoaders = files.map(function(f) {
            return function(cb) {
              return loadFile(f, cb);
            };
          });
          return async.parallel(fileLoaders, function(err, objs) {
            if (err) {
              return cb(err);
            }
            return sort(objs, cb);
          });
        });
      };
      return mkdirp(dir, action);
    },
    add: function(obj, cb) {
      var action;
      action = function(err) {
        var e, json;
        if (err) {
          return cb(err);
        }
        json = void 0;
        try {
          json = JSON.stringify(obj, null, 2);
        } catch (_error) {
          e = _error;
          return cb(e);
        }
        obj.id = obj.id || uuid.v4();
        return fs.writeFile(path.join(dir, obj.id + ".json"), json, "utf8", function(err) {
          if (err) {
            return cb(err);
          }
          return cb();
        });
      };
      return mkdirp(dir, action);
    },
    remove: function(obj, cb) {
      var action;
      action = function(err) {
        if (err) {
          return cb(err);
        }
        return fs.unlink(path.join(dir, obj.id + ".json"), function(err) {
          return cb(err);
        });
      };
      return mkdirp(dir, action);
    },
    load: function(id, cb) {
      return mkdirp(dir, function(err) {
        if (err) {
          return cb(err);
        }
        return loadFile(path.join(dir, id + ".json"), cb);
      });
    }
  };
};

readdir = function(dir, cb) {
  return fs.readdir(dir, function(err, files) {
    if (err) {
      return cb(err);
    }
    files = files.map(function(f) {
      return path.join(dir, f);
    });
    return cb(null, files);
  });
};

loadFile = function(f, cb) {
  return fs.readFile(f, "utf8", function(err, code) {
    var e;
    if (err) {
      return cb("error loading file" + err);
    }
    try {
      return cb(null, JSON.parse(code));
    } catch (_error) {
      e = _error;
      return cb("Error parsing " + f + ": " + e);
    }
  });
};

sort = function(objs, cb) {
  return async.sortBy(objs, (function(obj, cb) {
    return cb(null, obj.name || "");
  }), cb);
};
