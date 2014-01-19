// Generated by CoffeeScript 1.6.3
var anySpaceChar, clone, contains, endsWith, isAnyOf, logging, startsWith, timelog;

logging = require('./logging');

anySpaceChar = RegExp(/\s/);

exports.htmlCharacterEntity = RegExp(/&.*\b;$/);

exports.anySpaceChar = anySpaceChar;

endsWith = function(string, match) {
  return string.lastIndexOf(match) === string.length - match.length;
};

exports.endsWith = endsWith;

startsWith = function(string, match) {
  return string.indexOf(match) === 0;
};

exports.startsWith = startsWith;

contains = function(string, match) {
  return string.indexOf(match) !== -1;
};

exports.strip = function(string, prefix, suffix) {
  if (!startsWith(string, prefix)) {
    throw "Cannot strip string of the supplied prefix";
  }
  if (!endsWith(string, suffix)) {
    throw "Cannot strip string of the supplied suffix";
  }
  return string.slice(string.indexOf(prefix) + prefix.length, string.lastIndexOf(suffix));
};

isAnyOf = function(string, matches) {
  return matches.some(function(elem) {
    return elem.localeCompare(string, 'en-US') === 0;
  });
};

exports.isAnyOf = isAnyOf;

exports.objectPropertiesCount = function(object) {
  return Object.keys(object).length;
};

exports.endsWithAnyOf = function(string, matches) {
  var trailingChar;
  trailingChar = string.charAt(string.length - 1);
  if (!isAnyOf(trailingChar, matches)) {
    return false;
  }
  return trailingChar;
};

exports.startsWithAnyOf = function(string, matches) {
  var char;
  char = string.charAt(0);
  if (!isAnyOf(char, matches)) {
    return false;
  }
  return char;
};

exports.isAnySpaceChar = function(char) {
  return anySpaceChar.test(char);
};

exports.isSpaceCharsOnly = function(string) {
  var i, _i, _ref;
  for (i = _i = 0, _ref = string.length() - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
    if (!isAnySpaceChar(string.charAt[i])) {
      return false;
    }
  }
  return true;
};

exports.lastChar = function(string) {
  return string.charAt(string.length - 1);
};

exports.last = function(array) {
  return array[array.length - 1];
};

exports.first = function(array) {
  return array[0];
};

exports.parseElementTextOld = function(xmlNode) {
  var content;
  content = xmlNode.substr(0, xmlNode.length - "</div>".length);
  content = content.slice(content.indexOf(">") + 1);
  return content;
};

exports.logObject = function(obj) {
  return logging.log(JSON.stringify(obj, null, 2));
};

timelog = function(timer, logger) {
  var end, start;
  if (timelog.timersLookup == null) {
    timelog.timersLookup = {};
  }
  if (timelog.timersLookup[timer] != null) {
    end = new Date();
    if (logger != null) {
      logger.info(timer + ' took: ' + (end.getTime() - timelog.timersLookup[timer]) + ' ms');
    } else {
      logging.log(timer + ' took: ' + (end.getTime() - timelog.timersLookup[timer]) + ' ms');
    }
    return delete timelog.timersLookup[timer];
  } else {
    start = new Date();
    return timelog.timersLookup[timer] = start.getTime();
  }
};

exports.timelog = timelog;

exports.objectViolation = function(errorMessage) {
  var error;
  error = new Error(errorMessage);
  logging.log(error.stack);
  throw error;
};

clone = function(obj) {
  var key, newInstance;
  if ((obj == null) || typeof obj !== 'object') {
    return obj;
  }
  newInstance = {};
  for (key in obj) {
    newInstance[key] = clone(obj[key]);
  }
  return newInstance;
};

exports.clone = clone;

exports.pushIfTrue = function(array, functionResult) {
  if (functionResult) {
    array.push(functionResult);
    return true;
  }
  return false;
};
