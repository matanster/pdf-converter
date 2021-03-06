// Generated by CoffeeScript 1.6.3
var logging;

logging = require('../util/logging');

exports.generateDistribution = function(array) {
  var arrayItem, distributionArray, distributionObject, key, val, _i, _len;
  distributionObject = {};
  for (_i = 0, _len = array.length; _i < _len; _i++) {
    arrayItem = array[_i];
    if (distributionObject[arrayItem] != null) {
      distributionObject[arrayItem] += 1;
    } else {
      distributionObject[arrayItem] = 1;
    }
  }
  distributionArray = [];
  for (key in distributionObject) {
    val = distributionObject[key];
    distributionArray.push({
      key: key,
      val: val
    });
  }
  distributionArray.sort(function(a, b) {
    return parseFloat(b.val) - parseFloat(a.val);
  });
  return distributionArray;
};

exports.average = function(array, valRef) {
  var item, sum, _i, _len;
  sum = 0;
  for (_i = 0, _len = array.length; _i < _len; _i++) {
    item = array[_i];
    sum += valRef(item);
  }
  return sum / array.length;
};

exports.analytic = function(tokens) {
  var frequencies, frequency, token, word, wordFrequencies, wordFrequenciesArray, _i, _len;
  frequencies = function(objectsArray, filterKey, filterBy, property, parentProperty) {
    var array, key, map, object, val, value, _i, _len, _ref;
    map = {};
    for (_i = 0, _len = objectsArray.length; _i < _len; _i++) {
      object = objectsArray[_i];
      if (object[filterKey] === filterBy) {
        _ref = object[parentProperty];
        for (key in _ref) {
          value = _ref[key];
          if (key === property) {
            value = parseFloat(value);
            if (map[value] != null) {
              map[value] += 1;
            } else {
              map[value] = 1;
            }
          }
        }
      }
    }
    array = [];
    for (key in map) {
      val = map[key];
      array.push({
        key: key,
        val: val
      });
    }
    return array.sort(function(a, b) {
      return parseFloat(b.val) - parseFloat(a.val);
    });
  };
  frequencies(tokens, 'metaType', 'regular', 'left', 'positionInfo');
  frequencies(tokens, 'metaType', 'regular', 'font-size', 'finalStyles');
  util.timelog('Calculating word frequencies');
  wordFrequencies = {};
  for (_i = 0, _len = tokens.length; _i < _len; _i++) {
    token = tokens[_i];
    if (!(token.metaType === 'regular')) {
      continue;
    }
    word = token.text;
    if (wordFrequencies[word] != null) {
      wordFrequencies[word] += 1;
    } else {
      wordFrequencies[word] = 1;
    }
  }
  util.timelog('Calculating word frequencies');
  util.timelog('Sorting frequencies');
  wordFrequenciesArray = [];
  for (word in wordFrequencies) {
    frequency = wordFrequencies[word];
    wordFrequenciesArray.push({
      word: word,
      frequency: frequency
    });
  }
  wordFrequenciesArray.sort(function(a, b) {
    return parseInt(b.frequency) - parseInt(a.frequency);
  });
  return util.timelog('Sorting frequencies');
};
