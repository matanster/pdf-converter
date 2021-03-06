// Generated by CoffeeScript 1.6.3
var acronym, ctype, specialCaseWords, util;

util = require('../util/util');

ctype = require('../util/ctype');

specialCaseWords = ['vs.', 'al.', 'cf.', 'st.', 'Fig.', 'FIG.'];

acronym = function(string) {
  var firstIndex;
  firstIndex = string.indexOf('.');
  if (firstIndex === -1) {
    return false;
  }
  if (firstIndex < string.length - 1) {
    return true;
  }
  return false;
};

exports.endOfSentence = function(tokens, t) {
  var length, match, nextString, string, _i, _len, _ref;
  string = tokens[t].text;
  length = string.length;
  if ((_ref = string.charAt(length - 1)) === '?' || _ref === '!') {
    return true;
  }
  if (string.charAt(length - 1) === '.') {
    for (_i = 0, _len = specialCaseWords.length; _i < _len; _i++) {
      match = specialCaseWords[_i];
      if (util.endsWith(string, match)) {
        return false;
      }
    }
    if (acronym(string)) {
      if (t + 2 < tokens.length) {
        if (tokens[t + 1].metaType === 'delimiter') {
          if (tokens[t + 2].metaType === 'regular') {
            nextString = tokens[t + 2].text;
            if (ctype.isUpperCaseChar(nextString.charAt(0))) {
              return true;
            }
          }
        }
      }
      return false;
    }
    return true;
  }
  return false;
};
