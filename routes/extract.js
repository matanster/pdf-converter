// Generated by CoffeeScript 1.4.0
var css, html, util;

require("fs");

util = require("../util");

css = require("../css");

html = require("../html");

exports.go = function(req, res) {
  var div, divs, name, path, rawHtml, styledText;
  path = '../local-copies/' + 'html-converted/';
  name = req.query.name;
  rawHtml = fs.readFileSync(path + name + '/' + name + ".html").toString();
  divs = html.removeOuterDivs(rawHtml);
  styledText = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = divs.length; _i < _len; _i++) {
      div = divs[_i];
      _results.push(html.deconstructDiv(div));
    }
    return _results;
  })();
  css.simpleGetStyles(rawHtml, path + name + '/');
  util.logObject(styledText);
  res.write("read raw html of length " + rawHtml.length + " bytes");
  return res.end;
};
