// Generated by CoffeeScript 1.4.0
var removeOuterDivs, util;

require("fs");

util = require("../myStringUtil");

removeOuterDivs = function(string) {
  var regex;
  regex = new RegExp("<div((?!div).)*</div>", "g");
  return string.match(regex);
};

exports.go = function(req, res) {
  var div, divs, divsContent, rawHtml;
  rawHtml = fs.readFileSync("../local-copies/" + "html-converted/" + req.query.file).toString();
  divs = removeOuterDivs(rawHtml);
  divsContent = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = divs.length; _i < _len; _i++) {
      div = divs[_i];
      _results.push(util.simpleGetDivContent(div));
    }
    return _results;
  })();
  return res.send("read raw html of length " + rawHtml.length + " bytes");
};
