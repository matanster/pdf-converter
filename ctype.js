// Generated by CoffeeScript 1.4.0
var isAlphabetChar, isLowerCaseChar;

isAlphabetChar = function(char) {
  return char.toUpperCase() !== char.toLowerCase();
};

exports.isAlphabetChar = isAlphabetChar;

isLowerCaseChar = function(char) {
  return char === char.toLowerCase();
};

exports.isLowerCaseChar = isLowerCaseChar;

exports.testPureUpperCase = function(string) {
  var char, _i, _len, _ref;
  _ref = string.split('');
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    char = _ref[_i];
    if (!isAlphabetChar(char)) {
      return false;
    }
    if (isAlphabetChar(char)) {
      return false;
    }
  }
  return true;
};

exports.testWeakUpperCase = function(string) {
  var char, _i, _len, _ref;
  _ref = string.split('');
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    char = _ref[_i];
    if (isAlphabetChar(char)) {
      if (isAlphabetChar(char)) {
        return false;
      }
    }
  }
  return true;
};