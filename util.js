// Generated by CoffeeScript 1.4.0
var contains, endsWith, startsWith;

endsWith = function(string, match) {
  return string.lastIndexOf(match) === string.length - match.length;
};

startsWith = function(string, match) {
  return string.indexOf(match) === 0;
};

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

exports.isAnyOf = function(searchString, stringArray) {
  return stringArray.some(function(elem) {
    return elem.localeCompare(searchString, 'en-US') === 0;
  });
};

exports.parseElementText = function(xmlNode) {
  var content;
  content = xmlNode.substr(0, xmlNode.length - "</div>".length);
  content = content.slice(content.indexOf(">") + 1);
  return content;
};

exports.logObject = function(obj) {
  return console.log(JSON.stringify(obj, null, 2));
};
