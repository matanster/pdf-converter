// Generated by CoffeeScript 1.4.0
var css, filterImages, filterZeroLengthText, html, isImage, model, output, timer, util;

require("fs");

util = require("../util");

timer = require("../timer");

css = require("../css");

html = require("../html");

model = require("../model");

output = require("../output");

isImage = function(text) {
  return util.startsWith(text, "<img ");
};

filterImages = function(ourDivRepresentation) {
  var div, filtered, _i, _len;
  filtered = [];
  for (_i = 0, _len = ourDivRepresentation.length; _i < _len; _i++) {
    div = ourDivRepresentation[_i];
    if (!isImage(div.text)) {
      filtered.push(div);
    }
  }
  return filtered;
};

filterZeroLengthText = function(ourDivRepresentation) {
  var div, filtered, _i, _len;
  filtered = [];
  for (_i = 0, _len = ourDivRepresentation.length; _i < _len; _i++) {
    div = ourDivRepresentation[_i];
    if (!(div.text.length === 0)) {
      filtered.push(div);
    }
  }
  return filtered;
};

exports.go = function(req, res) {
  var abbreviations, augmentEachDiv, div, divTokens, divsNum, divsWithStyles, documentQuantifiers, endsSpaceDelimited, frequency, group, groups, id, name, outputHtml, path, rawHtml, rawRelevantDivs, realStyles, token, tokens, word, wordFrequencies, wordFrequenciesArray, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _o, _p, _q, _r;
  util.timelog('Extraction from html stage A');
  path = '../local-copies/' + 'html-converted/';
  name = req.query.name;
  rawHtml = fs.readFileSync(path + name + '/' + name + ".html").toString();
  realStyles = css.simpleFetchStyles(rawHtml, path + name + '/');
  rawRelevantDivs = html.removeOuterDivs(rawHtml);
  divsWithStyles = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = rawRelevantDivs.length; _i < _len; _i++) {
      div = rawRelevantDivs[_i];
      _results.push(html.representDiv(div));
    }
    return _results;
  })();
  divsWithStyles = filterImages(divsWithStyles);
  for (_i = 0, _len = divsWithStyles.length; _i < _len; _i++) {
    div = divsWithStyles[_i];
    html.stripSpanWrappers(div);
  }
  divsWithStyles = filterZeroLengthText(divsWithStyles);
  divsNum = divsWithStyles.length;
  endsSpaceDelimited = 0;
  for (_j = 0, _len1 = divsWithStyles.length; _j < _len1; _j++) {
    div = divsWithStyles[_j];
    if (util.isAnySpaceChar(util.lastChar(div.text))) {
      endsSpaceDelimited += 1;
    }
  }
  console.log(endsSpaceDelimited);
  console.log(endsSpaceDelimited / divsNum);
  if ((endsSpaceDelimited / divsNum) < 0.3) {
    augmentEachDiv = true;
  } else {
    augmentEachDiv = false;
  }
  divTokens = [];
  for (_k = 0, _len2 = divsWithStyles.length; _k < _len2; _k++) {
    div = divsWithStyles[_k];
    tokens = html.tokenize(div.text);
    for (_l = 0, _len3 = tokens.length; _l < _len3; _l++) {
      token = tokens[_l];
      switch (token.metaType) {
        case 'regular':
          token.styles = div.styles;
      }
    }
    if (augmentEachDiv) {
      tokens.push({
        'metaType': 'delimiter'
      });
    }
    divTokens.push(tokens);
  }
  tokens = [];
  for (_m = 0, _len4 = divTokens.length; _m < _len4; _m++) {
    div = divTokens[_m];
    for (_n = 0, _len5 = div.length; _n < _len5; _n++) {
      token = div[_n];
      tokens.push(token);
    }
  }
  for (_o = 0, _len6 = tokens.length; _o < _len6; _o++) {
    token = tokens[_o];
    if (token.metaType === 'regular') {
      if (token.text.length === 0) {
        throw "Error - zero length text in data";
      }
    }
  }
  if (tokens.length === 0) {
    console.log("No text was extracted from input");
    throw "No text was extracted from input";
  }
  tokens.reduce(function(x, y, index) {
    if (x.metaType === 'regular' && y.metaType === 'regular') {
      if (util.endsWith(x.text, '-')) {
        x.text = x.text.slice(0, -1);
        x.text = x.text.concat(y.text);
        tokens.splice(index, 1);
        return x;
      }
    }
    return y;
  });
  tokens.reduce(function(x, y, index) {
    if (x.metaType === 'regular' && y.metaType === 'delimiter' && index < (tokens.length - 1)) {
      if (util.endsWith(x.text, '-')) {
        x.text = x.text.slice(0, -1);
        x.text = x.text.concat(tokens[index + 1].text);
        tokens.splice(index, 2);
        return x;
      }
    }
    return y;
  });
  util.timelog('Extraction from html stage A');
  id = 0;
  for (_p = 0, _len7 = tokens.length; _p < _len7; _p++) {
    token = tokens[_p];
    token.id = id;
    id += 1;
  }
  tokens.reduce(function(x, y) {
    if (y.metaType === 'delimiter') {
      y.styles = x.styles;
    }
    return y;
  });
  util.timelog('Sentence tokenizing');
  abbreviations = 0;
  groups = [];
  group = [];
  for (_q = 0, _len8 = tokens.length; _q < _len8; _q++) {
    token = tokens[_q];
    if (token.type = 'regular') {
      group.push(token);
      if (token.text === '.') {
        if (!(group.length > (1 + 1))) {
          abbreviations += 1;
        } else {
          groups.push(group);
          group = [];
        }
      }
    }
  }
  if (group.length !== 0) {
    groups.push(group);
  }
  util.timelog('Sentence tokenizing');
  documentQuantifiers = {};
  documentQuantifiers['sentences'] = groups.length;
  documentQuantifiers['period-trailed-abbreviations'] = abbreviations;
  console.dir(documentQuantifiers);
  util.timelog('Calculating word frequencies');
  wordFrequencies = {};
  for (_r = 0, _len9 = tokens.length; _r < _len9; _r++) {
    token = tokens[_r];
    if (!(token.metaType === 'regular')) {
      continue;
    }
    word = token.text;
    if (wordFrequencies[word] != null) {
      wordFrequencies[word] += 1;
    } else {
      wordFrequencies[word] = 0;
    }
  }
  util.timelog('Calculating word frequencies');
  util.timelog('Sorting frequencies took');
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
  util.timelog('Sorting frequencies took');
  outputHtml = html.buildOutputHtml(tokens, realStyles);
  return output.serveOutput(outputHtml, name, res);
};
