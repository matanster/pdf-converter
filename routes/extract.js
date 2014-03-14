// Generated by CoffeeScript 1.6.3
var analytic, css, ctype, filterImages, filterZeroLengthText, fs, html, isImage, iterator, logging, markers, model, output, timer, titleAndAbstract, util, verbex;

fs = require('fs');

util = require('../util');

logging = require('../logging');

timer = require('../timer');

css = require('../css');

html = require('../html');

model = require('../model');

output = require('../output');

ctype = require('../ctype');

markers = require('../markers');

analytic = require('../analytic');

verbex = require('verbal-expressions');

iterator = function(tokens, iterationFunc) {
  var a, b, i, _results;
  i = 1;
  _results = [];
  while (i < tokens.length) {
    a = tokens[i - 1];
    b = tokens[i];
    _results.push(i = i + iterationFunc(a, b, i, tokens));
  }
  return _results;
};

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

titleAndAbstract = function(tokens) {
  var abstract, fontSizes, fontSizesDistribution, largestFontSizeSequence, mainFontSize, minAbstractTokensNum, minTitleTokensNum, sequence, sequences, t, title, token, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _ref;
  fontSizes = [];
  for (_i = 0, _len = tokens.length; _i < _len; _i++) {
    token = tokens[_i];
    fontSizes.push(parseFloat(token.finalStyles['font-size']));
  }
  fontSizesDistribution = analytic.generateDistribution(fontSizes);
  console.dir(fontSizesDistribution);
  mainFontSize = parseFloat(util.first(fontSizesDistribution).key);
  sequences = [];
  sequence = {
    'font-size': tokens[0].finalStyles['font-size'],
    'font-family': tokens[0].finalStyles['font-family'],
    'start': 0
  };
  for (t = _j = 1, _ref = tokens.length - 1; 1 <= _ref ? _j <= _ref : _j >= _ref; t = 1 <= _ref ? ++_j : --_j) {
    if (!(parseInt(tokens[t].page) === 1)) {
      continue;
    }
    token = tokens[t];
    if ((token.finalStyles['font-size'] !== sequence['font-size']) || (token.finalStyles['font-family'] !== sequence['font-family'])) {
      sequence.endToken = t - 1;
      sequence.numOfTokens = sequence.endToken - sequence.start + 1;
      sequences.push(sequence);
      sequence = {
        'font-size': token.finalStyles['font-size'],
        'font-family': token.finalStyles['font-family'],
        'startToken': t,
        'startLeft': parseFloat(token.positionInfo.left),
        'startBottom': parseFloat(token.positionInfo.bottom)
      };
    }
  }
  minAbstractTokensNum = 50;
  minTitleTokensNum = 7;
  sequences.sort(function(a, b) {
    return b.startBottom - a.startBottom;
  });
  largestFontSizeSequence = 0;
  for (_k = 0, _len1 = sequences.length; _k < _len1; _k++) {
    sequence = sequences[_k];
    if (parseFloat(sequence['font-size']) > largestFontSizeSequence) {
      largestFontSizeSequence = parseFloat(sequence['font-size']);
    }
  }
  for (_l = 0, _len2 = sequences.length; _l < _len2; _l++) {
    sequence = sequences[_l];
    console.log(parseFloat(sequence['font-size']) + ' ' + largestFontSizeSequence);
    console.log(sequence.startBottom);
    util.simpleLogSequence(tokens, sequence, 'sequence');
    if (parseFloat(sequence['font-size']) === largestFontSizeSequence) {
      console.log('IS LARGEST FONT SIZE');
      if (sequence.numOfTokens > minTitleTokensNum) {
        title = sequence;
        break;
      }
    }
  }
  for (_m = 0, _len3 = sequences.length; _m < _len3; _m++) {
    sequence = sequences[_m];
    if (sequence.numOfTokens > minAbstractTokensNum) {
      abstract = sequence;
      break;
    }
  }
  if (abstract != null) {
    util.markTokens(tokens, abstract, 'abstract');
  } else {
    console.warn('abstract not detected');
  }
  if (title != null) {
    return util.markTokens(tokens, title, 'title');
  } else {
    return console.warn('title not detected');
  }
};

exports.go = function(req, name, res, docLogger) {
  var GT, ST, a, abbreviations, addStyleSeparationDelimiter, averageParagraphLength, b, bottom, connect_token_group, cssClass, cssClasses, currOpener, docSieve, documentQuantifiers, dom, entry, extreme, extremeSequence, extremeSequences, extremes, filtered, group, groups, handler, htmlparser, i, id, inputStylesMap, lastOpenerIndex, lineOpeners, lineOpenersDistribution, lineOpenersForStats, lineSpaceDistribution, lineSpaces, markSentence, newLineThreshold, nextOpener, node, nodesWithStyles, page, pageOpeners, paragraphs, paragraphsRatio, parser, path, physicalPageSide, position, prevOpener, prevToken, rawHtml, repeat, repeatSequence, style, styles, t, textIndex, token, tokenArray, tokenArrays, tokens, top, _aa, _ab, _ac, _ad, _ae, _i, _j, _k, _l, _len, _len1, _len10, _len11, _len12, _len13, _len14, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _o, _p, _q, _r, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _results, _s, _t, _u, _v, _w, _x, _y, _z;
  util.timelog('Extraction from html stage A');
  path = '../local-copies/' + 'html-converted/';
  rawHtml = fs.readFileSync(path + name + '/' + name + ".html").toString();
  inputStylesMap = css.simpleFetchStyles(rawHtml, path + name + '/');
  htmlparser = require("htmlparser2");
  util.timelog('htmlparser2');
  handler = new htmlparser.DomHandler(function(error, dom) {
    if (error) {
      return docLogger.error('htmlparser2 failed loading document');
    } else {
      return docLogger.info('htmlparser2 loaded document');
    }
  });
  parser = new htmlparser.Parser(handler);
  parser.parseComplete(rawHtml);
  dom = handler.dom;
  util.timelog('htmlparser2', docLogger);
  nodesWithStyles = html.representNodes(dom);
  tokenArrays = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = nodesWithStyles.length; _i < _len; _i++) {
      node = nodesWithStyles[_i];
      _results.push(html.tokenize(node));
    }
    return _results;
  })();
  tokens = [];
  for (_i = 0, _len = tokenArrays.length; _i < _len; _i++) {
    tokenArray = tokenArrays[_i];
    for (_j = 0, _len1 = tokenArray.length; _j < _len1; _j++) {
      token = tokenArray[_j];
      tokens.push(token);
    }
  }
  if (tokens.length === 0) {
    docLogger.error("No text was extracted from input");
    console.info("No text was extracted from input");
    res.writeHead(505);
    res.write('We are sorry but the pdf you uploaded ' + '(' + name + ')' + ' cannot be processed. We are working on finding a better copy of the same article and will get back to you with it.');
    res.end();
    return false;
  }
  tokens.reduce(function(x, y) {
    if (y.metaType === 'delimiter') {
      y.stylesArray = x.stylesArray;
    }
    return y;
  });
  for (_k = 0, _len2 = tokens.length; _k < _len2; _k++) {
    token = tokens[_k];
    if (token.metaType === 'regular') {
      if (token.text.length === 0) {
        throw "Error - zero length text in data";
      }
    }
  }
  for (_l = 0, _len3 = tokens.length; _l < _len3; _l++) {
    token = tokens[_l];
    token.finalStyles = {};
    token.positionInfo = {};
    _ref = token.stylesArray;
    for (_m = 0, _len4 = _ref.length; _m < _len4; _m++) {
      cssClasses = _ref[_m];
      for (_n = 0, _len5 = cssClasses.length; _n < _len5; _n++) {
        cssClass = cssClasses[_n];
        styles = css.getFinalStyles(cssClass, inputStylesMap);
        if (styles != null) {
          for (_o = 0, _len6 = styles.length; _o < _len6; _o++) {
            style = styles[_o];
            if (util.isAnyOf(style.property, css.positionData)) {
              token.positionInfo[style.property] = style.value;
            } else {
              token.finalStyles[style.property] = style.value;
            }
          }
        }
      }
    }
    if (util.objectPropertiesCount(token.finalStyles) === 0) {
      docLogger.warn('No final styles applied to token');
      docLogger.warn(token);
    }
  }
  page = null;
  pageOpeners = [util.first(tokens)];
  iterator(tokens, function(a, b, i, tokens) {
    if (a.page !== b.page) {
      pageOpeners.push(b);
    }
    return 1;
  });
  util.timelog('remove repeat headers and footers');
  GT = function(j, k) {
    return j > k;
  };
  ST = function(j, k) {
    return j < k;
  };
  top = {
    name: 'top',
    goalName: 'header',
    comparer: GT,
    extreme: 0
  };
  bottom = {
    name: 'bottom',
    goalName: 'footer',
    comparer: ST,
    extreme: 100000
  };
  extremes = [top, bottom];
  for (_p = 0, _len7 = extremes.length; _p < _len7; _p++) {
    extreme = extremes[_p];
    for (_q = 0, _len8 = tokens.length; _q < _len8; _q++) {
      token = tokens[_q];
      position = parseInt(token.positionInfo.bottom);
      if (extreme.comparer(position, extreme.extreme)) {
        extreme.extreme = position;
      }
    }
    extremeSequences = [];
    extremeSequence = [];
    iterator(tokens, function(a, b, i, tokens) {
      var consoleMsg;
      if (Math.abs(parseInt(a.positionInfo.bottom) - extreme.extreme) < 2) {
        extremeSequence.push(a);
        if (!(Math.abs(parseInt(b.positionInfo.bottom) - extreme.extreme) < 2)) {
          extremeSequences.push(extremeSequence);
          consoleMsg = (function() {
            var _len9, _r, _results;
            _results = [];
            for (_r = 0, _len9 = extremeSequence.length; _r < _len9; _r++) {
              token = extremeSequence[_r];
              _results.push(token.text);
            }
            return _results;
          })();
          extremeSequence = [];
        }
      }
      return 1;
    });
    for (physicalPageSide = _r = 0; _r <= 1; physicalPageSide = ++_r) {
      repeatSequence = 0;
      for (i = _s = physicalPageSide, _ref1 = extremeSequences.length - 1 - 2; _s <= _ref1; i = _s += 2) {
        a = extremeSequences[i];
        b = extremeSequences[i + 2];
        repeat = true;
        if (a.length === b.length) {
          for (t = _t = 0, _ref2 = a.length - 1; 0 <= _ref2 ? _t <= _ref2 : _t >= _ref2; t = 0 <= _ref2 ? ++_t : --_t) {
            if (!((b[t].text === a[t].text) || (Math.abs(parseInt(b[t].text) - parseInt(a[t].text)) === 2))) {
              repeat = false;
            }
          }
          if (repeat) {
            console.log('repeat header/footer:');
            for (t = _u = 0, _ref3 = a.length - 1; 0 <= _ref3 ? _u <= _ref3 : _u >= _ref3; t = 0 <= _ref3 ? ++_u : --_u) {
              a[t].fluff = true;
              b[t].fluff = true;
            }
            repeatSequence += 1;
          }
        }
      }
      if (!(repeatSequence > 0)) {
        console.log('no repeat ' + extreme.goalName + ' ' + 'detected in article' + ' ' + 'in pass' + ' ' + physicalPageSide);
      } else {
        console.log(repeatSequence + ' ' + 'repeat' + ' ' + extreme.goalName + 's' + ' ' + 'detected in article' + ' ' + 'in pass' + ' ' + physicalPageSide);
      }
    }
  }
  filtered = [];
  for (t = _v = 0, _ref4 = tokens.length - 1; 0 <= _ref4 ? _v <= _ref4 : _v >= _ref4; t = 0 <= _ref4 ? ++_v : --_v) {
    if (tokens[t].fluff == null) {
      filtered.push(tokens[t]);
    } else {

    }
  }
  tokens = filtered;
  util.timelog('remove repeat headers and footers');
  util.timelog('basic handle line and paragraph beginnings');
  /*
  util.timelog 'making copy'
  tokens = JSON.parse(JSON.stringify(tokens))
  util.timelog 'making copy'
  */

  lineOpeners = [];
  lineOpenersForStats = [];
  lineSpaces = [];
  util.first(tokens).lineLocation = 'opener';
  for (i = _w = 1, _ref5 = tokens.length - 1; 1 <= _ref5 ? _w <= _ref5 : _w >= _ref5; i = 1 <= _ref5 ? ++_w : --_w) {
    a = tokens[i - 1];
    b = tokens[i];
    if (parseFloat(b.positionInfo.bottom) > parseFloat(a.positionInfo.bottom) + 100) {
      a.lineLocation = 'closer';
      b.lineLocation = 'opener';
      a.columnCloser = true;
      b.columnOpener = true;
      lineOpeners.push(i);
      lineOpenersForStats.push(parseFloat(b.positionInfo.left));
    } else {
      if (parseFloat(b.positionInfo.bottom) + 5 < parseFloat(a.positionInfo.bottom)) {
        a.lineLocation = 'closer';
        b.lineLocation = 'opener';
        lineOpeners.push(i);
        lineOpenersForStats.push(parseFloat(b.positionInfo.left));
        lineSpaces.push(parseFloat(a.positionInfo.bottom) - parseFloat(b.positionInfo.bottom));
      }
    }
  }
  lineSpaceDistribution = analytic.generateDistribution(lineSpaces);
  newLineThreshold = parseFloat(util.first(lineSpaceDistribution).key) + 1;
  console.log("ordinary new line space set to the document's most common line space of " + newLineThreshold);
  util.last(tokens).lineLocation = 'closer';
  for (i = _x = 1, _ref6 = lineOpeners.length - 1 - 1; 1 <= _ref6 ? _x <= _ref6 : _x >= _ref6; i = 1 <= _ref6 ? ++_x : --_x) {
    currOpener = tokens[lineOpeners[i]];
    prevOpener = tokens[lineOpeners[i - 1]];
    nextOpener = tokens[lineOpeners[i + 1]];
    prevToken = tokens[lineOpeners[i] - 1];
    if (parseInt(currOpener.positionInfo.left) > parseInt(prevOpener.positionInfo.left)) {
      if (currOpener.columnOpener) {
        if (parseInt(currOpener.positionInfo.left) > parseInt(nextOpener.positionInfo.left)) {
          currOpener.paragraph = 'opener';
          prevToken.paragraph = 'closer';
        }
      } else {
        currOpener.paragraph = 'opener';
        prevToken.paragraph = 'closer';
      }
    }
    if (parseFloat(currOpener.positionInfo.bottom) + newLineThreshold < parseFloat(prevOpener.positionInfo.bottom)) {
      currOpener.paragraph = 'opener';
      prevToken.paragraph = 'closer';
    }
  }
  util.timelog('basic handle line and paragraph beginnings');
  lastOpenerIndex = 0;
  paragraphs = [];
  for (i = _y = 0, _ref7 = tokens.length - 1; 0 <= _ref7 ? _y <= _ref7 : _y >= _ref7; i = 0 <= _ref7 ? ++_y : --_y) {
    if (tokens[i].paragraph === 'opener') {
      paragraphs.push({
        'length': i - lastOpenerIndex,
        'opener': tokens[i]
      });
      lastOpenerIndex = i;
    }
  }
  console.log("detected " + paragraphs.length + " paragraphs");
  console.log(parseInt(util.last(tokens).page));
  paragraphsRatio = paragraphs.length / parseInt(util.last(tokens).page);
  averageParagraphLength = analytic.average(paragraphs, function(a) {
    return a.length;
  });
  console.log("paragraphs to pages ratio: " + paragraphsRatio);
  console.log("average paragraph length:  " + averageParagraphLength);
  lineOpenersDistribution = analytic.generateDistribution(lineOpenersForStats);
  for (_z = 0, _len9 = lineOpenersDistribution.length; _z < _len9; _z++) {
    entry = lineOpenersDistribution[_z];
    console.log("line beginnings on left position " + entry.key + " - detected " + entry.val + " times");
  }
  /*
  paragraphLengthsDistribution = analytic.generateDistribution(paragraphLengths)
  for entry in paragraphLengthsDistribution
   console.log """paragraph length of #{entry.key} tokens - detected #{entry.val} times"""
  */

  titleAndAbstract(tokens);
  addStyleSeparationDelimiter = function(i, tokens) {
    var newDelimiter;
    a = tokens[i];
    newDelimiter = {
      'metaType': 'delimiter'
    };
    newDelimiter.styles = a.styles;
    newDelimiter.finalStyles = a.finalStyles;
    newDelimiter.page = a.page;
    return tokens.splice(i, 0, newDelimiter);
  };
  tokens.reduce(function(a, b, i, tokens) {
    if (a.lineLocation !== 'closer') {
      switch (false) {
        case !(parseInt(b.positionInfo.bottom) > parseInt(a.positionInfo.bottom)):
          b.superscript = true;
          addStyleSeparationDelimiter(i, tokens);
          break;
        case !(parseInt(b.positionInfo.bottom) < parseInt(a.positionInfo.bottom)):
          a.superscript = true;
          addStyleSeparationDelimiter(i, tokens);
      }
    }
    return b;
  });
  docLogger.info(tokens.length);
  iterator(tokens, function(a, b, i, tokens) {
    var newDelimiter;
    if (b.lineLocation === 'opener') {
      if (a.lineLocation === 'closer') {
        if (a.metaType === 'regular') {
          if (util.endsWith(a.text, '-')) {
            a.text = a.text.slice(0, -1);
            a.text = a.text.concat(b.text);
            tokens.splice(i, 1);
            return 0;
          } else {
            newDelimiter = {
              'metaType': 'delimiter'
            };
            newDelimiter.styles = a.styles;
            newDelimiter.finalStyles = a.finalStyles;
            newDelimiter.page = a.page;
            tokens.splice(i, 0, newDelimiter);
            return 2;
          }
        }
      }
    }
    return 1;
  });
  iterator(tokens, function(a, b, index, tokens) {
    if (a.metaType === 'regular' && b.metaType === 'regular') {
      a.text = a.text.concat(b.text);
      a.paragraph = b.paragraph;
      tokens.splice(index, 1);
      return 0;
    }
    return 1;
  });
  util.timelog('Extraction from html stage A', docLogger);
  util.timelog('ID seeding');
  id = 0;
  for (_aa = 0, _len10 = tokens.length; _aa < _len10; _aa++) {
    token = tokens[_aa];
    token.id = id;
    id += 1;
  }
  util.timelog('ID seeding', docLogger);
  textIndex = [];
  for (_ab = 0, _len11 = tokens.length; _ab < _len11; _ab++) {
    token = tokens[_ab];
    if (token.metaType === 'regular') {
      textIndex.push({
        text: token.text,
        id: token.id
      });
    }
  }
  util.timelog('Index creation');
  textIndex.sort(function(a, b) {
    if (a.text > b.text) {
      return 1;
    } else {
      return -1;
    }
  });
  util.timelog('Index creation', docLogger);
  /*
  markersRegex = ''
  
  for m in [0..markers.markers.array.length-1]
    markerText = markers.markers.array[m].WordOrPattern
    markerRegex = ''
  
    unless m is 40 then markersRegex += "|"  # add logical 'or' to regex 
  
    if markers.anything.test(markerText)
      docLogger.info('in split for: ' + markerText)
      splitText = markerText.split(markers.anything)
      for s in [0..splitText.length-1]
        unless s is 0 then markerRegex += '|'    # add logical 'or' to regex 
        if markers.anything.test(splitText[s])
          markerRegex += '\s'                    # add logical 'and then anything' to regex
          docLogger.info('anything found')
        else
          markerRegex += splitText[s]            # add as-is text to the regex
          docLogger.info('no anything marker')
    else
      markerRegex += markerText
  
  
    markersRegex += markerRegex
    #docLogger.info(markerText)
    #docLogger.info(markerRegex.source)
    docLogger.info(markersRegex)
  
    
    util.timelog('Markers visualization') 
    #docLogger.info('Marker regex length is ' + markersRegex.toString().length)
    #docLogger.info(markersRegex.source)
    #testverbex = verbex().then("verbex testing sentence").or().then("and more")
    #docLogger.info(testverbex.toRegExp().source)
  */

  docSieve = markers.createDocumentSieve(markers.baseSieve);
  for (_ac = 0, _len12 = tokens.length; _ac < _len12; _ac++) {
    token = tokens[_ac];
    if (token.metaType === 'regular') {
      token.calculatedProperties = [];
      if (util.pushIfTrue(token.calculatedProperties, ctype.testPureUpperCase(token.text))) {
        docLogger.info('All Caps Style detected for word: ' + token.text);
      }
      if (util.pushIfTrue(token.calculatedProperties, ctype.testInterspacedTitleWord(token.text))) {
        docLogger.info('Interspaced Title Word detected for word: ' + token.text);
      }
    }
  }
  util.timelog('Sentence tokenizing');
  connect_token_group = function(_arg) {
    var group, token;
    group = _arg.group, token = _arg.token;
    return group.push(token);
  };
  abbreviations = 0;
  groups = [];
  group = [];
  for (_ad = 0, _len13 = tokens.length; _ad < _len13; _ad++) {
    token = tokens[_ad];
    if (token.metaType === 'regular') {
      connect_token_group({
        group: group,
        token: token
      });
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
  util.timelog('Sentence tokenizing', docLogger);
  documentQuantifiers = {};
  documentQuantifiers['sentences'] = groups.length;
  documentQuantifiers['period-trailed-abbreviations'] = abbreviations;
  console.dir(documentQuantifiers);
  util.timelog('Markers visualization');
  markSentence = function(sentenceIdx) {
    var marker, matchedMarkers, outputHtml, sentence, _ae, _af, _len14, _len15;
    sentence = groups[sentenceIdx];
    matchedMarkers = [];
    if (sentence != null) {
      for (_ae = 0, _len14 = sentence.length; _ae < _len14; _ae++) {
        token = sentence[_ae];
        if (token.metaType !== 'delimiter') {
          for (_af = 0, _len15 = docSieve.length; _af < _len15; _af++) {
            marker = docSieve[_af];
            switch (marker.markerTokens[marker.nextExpected].metaType) {
              case 'regular':
                if (token.text === marker.markerTokens[marker.nextExpected].text) {
                  if (marker.nextExpected === (marker.markerTokens.length - 1)) {
                    matchedMarkers.push(marker);
                    token.emphasis = true;
                    marker.nextExpected = 0;
                  } else {
                    marker.nextExpected += 1;
                  }
                } else {
                  if (marker.markerTokens[marker.nextExpected].metaType !== 'anyOneOrMore') {
                    marker.nextExpected = 0;
                  }
                }
                break;
              case 'anyOneOrMore':
                if (marker.nextExpected === (marker.markerTokens.length - 1)) {
                  marker.nextExpected = 0;
                } else {
                  if (token.text === marker.markerTokens[marker.nextExpected + 1].text) {
                    if ((marker.nextExpected + 1) === (marker.markerTokens.length - 1)) {
                      matchedMarkers.push(marker);
                      token.emphasis = true;
                      marker.nextExpected = 0;
                    } else {
                      marker.nextExpected += 2;
                    }
                  }
                }
            }
          }
        }
      }
      sentenceIdx += 1;
      if (sentenceIdx < groups.length) {
        return setImmediate(function() {
          return markSentence(sentenceIdx);
        });
      } else {
        util.timelog('Markers visualization', docLogger);
        util.timelog('pickling');
        req.session.tokens = JSON.stringify(tokens);
        console.log(req.session.tokens.length);
        util.timelog('pickling');
        outputHtml = html.buildOutputHtml(tokens, inputStylesMap, docLogger);
        return output.serveOutput(outputHtml, name, res, docLogger);
      }
    } else {
      console.error('zero length sentence registered');
      console.error(sentenceIdx);
      console.error(groups.length);
      return console.error(name);
    }
  };
  markSentence(0);
  _results = [];
  for (_ae = 0, _len14 = tokens.length; _ae < _len14; _ae++) {
    token = tokens[_ae];
    if (token.page == null) {
      throw "Internal Error - token is missing page number";
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};
