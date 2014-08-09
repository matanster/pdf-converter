// Generated by CoffeeScript 1.6.3
var analytic, assert, createIndex, css, ctype, dataWriter, done, fs, generateFromHtml, headers, html, iterator, logging, markers, mode, refactorMode, refactorTools, sentenceSplitter, timer, titleAndAbstract, util, verbex;

verbex = require('verbal-expressions');

assert = require('assert');

fs = require('fs');

css = require('./css');

html = require('./html');

sentenceSplitter = require('./sentenceSplitter');

markers = require('./markers');

util = require('../util/util');

logging = require('../util/logging');

timer = require('../util/timer');

ctype = require('../util/ctype');

analytic = require('../util/analytic');

dataWriter = require('../data/dataWriter');

refactorTools = require('../refactorTools');

headers = require('./headers/headers');

mode = 'basic';

refactorMode = true;

createIndex = false;

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

titleAndAbstract = function(name, tokens) {
  var a, abstract, abstractEnd, b, firstPage, firstPageEnd, fontSizes, fontSizesDistribution, fontSizesUnique, i, introduction, lineOpeners, mainFontSize, minAbstractTokensNum, minTitleTokensNum, prev, rowLeftCurr, rowLeftLast, s, sequence, sequences, skipDelimiters, split, t, title, token, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _m, _n, _o, _p, _q, _r, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _s, _t, _u;
  util.timelog(name, 'Title and abstract recognition');
  firstPage = [];
  for (_i = 0, _len = tokens.length; _i < _len; _i++) {
    token = tokens[_i];
    if (token.page === '1') {
      firstPage.push(token);
    } else {
      break;
    }
  }
  for (t = _j = 0, _ref = tokens.length - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; t = 0 <= _ref ? ++_j : --_j) {
    if (parseFloat(tokens[t].page) > 1) {
      firstPageEnd = t - 1;
      break;
    }
  }
  if (firstPageEnd == null) {
    throw 'failed detecting end of first page';
  }
  dataWriter.write(name, 'stats', 'first page is ' + firstPageEnd + ' tokens long');
  fontSizes = [];
  for (_k = 0, _len1 = tokens.length; _k < _len1; _k++) {
    token = tokens[_k];
    fontSizes.push(parseFloat(token.finalStyles['font-size']));
  }
  fontSizesDistribution = analytic.generateDistribution(fontSizes);
  logging.cond("distribution of input font sizes:", 'fonts');
  logging.cond(fontSizesDistribution, 'fonts');
  mainFontSize = parseFloat(util.first(fontSizesDistribution).key);
  lineOpeners = [];
  for (t = _l = 1, _ref1 = tokens.length - 1; 1 <= _ref1 ? _l <= _ref1 : _l >= _ref1; t = 1 <= _ref1 ? ++_l : --_l) {
    if (!(parseInt(tokens[t].page) === 1)) {
      continue;
    }
    a = tokens[t - 1];
    b = tokens[t];
    if (parseFloat(b.positionInfo.bottom) + 5 < parseFloat(a.positionInfo.bottom)) {
      a.lineCloser = true;
      b.lineOpener = true;
      lineOpeners.push(t);
    }
  }
  sequences = [];
  sequence = {
    'font-size': tokens[0].finalStyles['font-size'],
    'font-family': tokens[0].finalStyles['font-family'],
    'startToken': 0,
    'startLeft': parseFloat(tokens[0].positionInfo.left),
    'startBottom': parseFloat(tokens[0].positionInfo.bottom)
  };
  for (t = _m = 1; 1 <= firstPageEnd ? _m <= firstPageEnd : _m >= firstPageEnd; t = 1 <= firstPageEnd ? ++_m : --_m) {
    token = tokens[t];
    prev = tokens[t - 1];
    split = false;
    if (token.lineOpener) {
      rowLeftLast = rowLeftCurr;
      rowLeftCurr = parseFloat(token.positionInfo.left);
    }
    if ((token.finalStyles['font-size'] !== sequence['font-size']) || (token.finalStyles['font-family'] !== sequence['font-family'])) {
      if (token.positionInfo.bottom !== prev.positionInfo.bottom) {
        if (!(token.lineOpener && Math.abs(rowLeftLast - rowLeftCurr) < 2)) {
          split = true;
        }
      }
    }
    if (parseFloat(prev.positionInfo.bottom) - parseFloat(token.positionInfo.bottom) > parseFloat(token.finalStyles['font-size']) * 0.25 * 2) {
      split = true;
    }
    if (split) {
      sequence.endToken = t - 1;
      sequence.numOfTokens = sequence.endToken - sequence.startToken + 1;
      sequences.push(sequence);
      sequence = {
        'font-size': token.finalStyles['font-size'],
        'font-family': token.finalStyles['font-family'],
        'startToken': t,
        'startText': token.text,
        'startLeft': parseFloat(token.positionInfo.left),
        'startBottom': parseFloat(token.positionInfo.bottom)
      };
    }
  }
  if (!sequence.endToken) {
    sequence.endToken = firstPageEnd;
    sequence.numOfTokens = sequence.endToken - sequence.startToken + 1;
    sequences.push(sequence);
  }
  sequences.sort(function(a, b) {
    if (b.startBottom === a.startBottom) {
      return b.startLeft - a.startLeft;
    }
    return b.startBottom - a.startBottom;
  });
  minAbstractTokensNum = 50;
  minTitleTokensNum = 6;
  fontSizesUnique = util.unique(fontSizes, true);
  fontSizesUnique.sort(function(a, b) {
    return b - a;
  });
  i = 0;
  while (!((title != null) || i > 2)) {
    for (_n = 0, _len2 = sequences.length; _n < _len2; _n++) {
      sequence = sequences[_n];
      if (parseFloat(sequence['font-size']) === fontSizesUnique[i]) {
        if (sequence.startBottom > 500) {
          if (sequence.numOfTokens > minTitleTokensNum) {
            title = sequence;
          }
        }
      }
    }
    i += 1;
  }
  skipDelimiters = function(tokens, startToken, endToken) {
    var _o;
    for (t = _o = startToken; startToken <= endToken ? _o <= endToken : _o >= endToken; t = startToken <= endToken ? ++_o : --_o) {
      if (tokens[t].metaType === 'regular') {
        return tokens[t];
      }
    }
    return null;
  };
  for (s = _o = 0, _len3 = sequences.length; _o < _len3; s = ++_o) {
    sequence = sequences[s];
    token = skipDelimiters(tokens, sequence.startToken, sequence.endToken);
    if (token != null) {
      if (token.text.toUpperCase() === 'ABSTRACT') {
        if (sequence.numOfTokens === 1) {
          if (s < sequences.length - 1) {
            abstract = sequences[s + 1];
            break;
          }
        }
      }
    }
  }
  if (abstract == null) {
    for (_p = 0, _len4 = sequences.length; _p < _len4; _p++) {
      sequence = sequences[_p];
      if (sequence.numOfTokens > minAbstractTokensNum) {
        abstract = sequence;
        break;
      }
    }
  }
  if (abstract != null) {
    util.markTokens(tokens, abstract, 'abstract');
  } else {
    console.warn('abstract not detected');
  }
  for (_q = 0, _len5 = sequences.length; _q < _len5; _q++) {
    introduction = sequences[_q];
    if ((tokens[introduction.startToken].text === 'Introduction') || (tokens[introduction.startToken].text === '1.' && tokens[introduction.startToken + 2].text === 'Introduction') || (tokens[introduction.startToken].text === '1' && tokens[introduction.startToken + 2].text === 'Introduction')) {
      console.log('introduction detected');
      for (_r = 0, _len6 = sequences.length; _r < _len6; _r++) {
        sequence = sequences[_r];
        if (parseFloat(sequence.startLeft) < parseFloat(introduction.startLeft)) {
          if (parseFloat(sequence.startBottom) <= parseFloat(introduction.startBottom)) {
            for (t = _s = _ref2 = sequence.startToken, _ref3 = sequence.endToken; _ref2 <= _ref3 ? _s <= _ref3 : _s >= _ref3; t = _ref2 <= _ref3 ? ++_s : --_s) {
              tokens;
            }
          }
        }
      }
    }
  }
  if (title != null) {
    util.markTokens(tokens, title, 'title');
  } else {
    console.warn('title not detected');
  }
  util.timelog(name, 'Title and abstract recognition');
  util.timelog(name, 'initial handling of first page fluff');
  if (abstract != null) {
    abstractEnd = tokens[abstract.endToken].positionInfo.bottom;
    for (_t = 0, _len7 = sequences.length; _t < _len7; _t++) {
      sequence = sequences[_t];
      if (!(sequence === title || sequence === abstract)) {
        if (parseFloat(tokens[sequence.startToken].positionInfo.bottom) > parseFloat(abstractEnd)) {
          for (t = _u = _ref4 = sequence.startToken, _ref5 = sequence.endToken; _ref4 <= _ref5 ? _u <= _ref5 : _u >= _ref5; t = _ref4 <= _ref5 ? ++_u : --_u) {
            tokens[t].fluff = true;
          }
        }
      }
    }
  }
  return util.timelog(name, 'initial handling of first page fluff');
};

generateFromHtml = function(req, name, input, res, docLogger, callback) {
  var GT, ST, a, abbreviations, addStyleSeparationDelimiter, averageParagraphLength, b, bottom, connect_token_group, cssClass, cssClasses, currOpener, docSieve, documentQuantifiers, dom, entry, error, extreme, extremeSequence, extremeSequences, extremes, filtered, group, groups, handler, htmlparser, i, id, inputStylesMap, lastOpenerIndex, lineOpeners, lineOpenersDistribution, lineOpenersForStats, lineSpaceDistribution, lineSpaces, markSentence, metaTypeLog, newLineThreshold, nextOpener, node, nodesWithStyles, page, pageOpeners, paragraphs, paragraphsRatio, parser, physicalPageSide, position, prevOpener, prevToken, rawHtml, repeat, repeatSequence, sentence, style, styles, t, textIndex, token, tokenArray, tokenArrays, tokens, top, _aa, _ab, _ac, _ad, _ae, _af, _ag, _ah, _ai, _aj, _i, _j, _k, _l, _len, _len1, _len10, _len11, _len12, _len13, _len14, _len15, _len16, _len17, _len18, _len19, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _o, _p, _q, _r, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _s, _t, _u, _v, _w, _x, _y, _z;
  util.timelog(name, 'Extraction from html stage A');
  rawHtml = fs.readFileSync(input.html).toString();
  inputStylesMap = css.simpleFetchStyles(rawHtml, input.css);
  htmlparser = require("htmlparser2");
  util.timelog(name, 'htmlparser2');
  handler = new htmlparser.DomHandler(function(error, dom) {
    if (error) {
      return docLogger.error('htmlparser2 failed loading document');
    } else {
      return docLogger.info('htmlparser2 loaded document');
    }
  });
  parser = new htmlparser.Parser(handler, {
    decodeEntities: true
  });
  parser.parseComplete(rawHtml);
  dom = handler.dom;
  util.timelog(name, 'htmlparser2');
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
    error = 'We are sorry but the pdf you uploaded ' + '(' + name + ')' + ' cannot be processed. We are working on finding a better copy of the same article and will get back to you with it.';
    callback(error, res, tokens, name, docLogger);
    return;
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
  util.timelog(name, 'uniting split tokens');
  dataWriter.write(name, 'stats', 'tokens count before uniting tokens: ' + tokens.length);
  iterator(tokens, function(a, b, index, tokens) {
    if (a.metaType === 'regular' && b.metaType === 'regular') {
      if (a.positionInfo.bottom === b.positionInfo.bottom) {
        if ((a.finalStyles['font-size'] === b.finalStyles['font-size']) && (a.finalStyles['font-family'] === b.finalStyles['font-family'])) {
          a.text = a.text.concat(b.text);
          tokens.splice(index, 1);
          return 0;
        }
      }
    }
    return 1;
  });
  dataWriter.write(name, 'stats', 'tokens count after uniting tokens:  ' + tokens.length);
  util.timelog(name, 'uniting split tokens');
  if (refactorMode) {
    refactorTools.deriveStructure(tokens);
    refactorTools.deriveStructureWithValues(tokens);
  }
  if (mode === 'bare') {
    callback(null, res, tokens, name, docLogger);
    return;
  }
  page = null;
  pageOpeners = [util.first(tokens)];
  iterator(tokens, function(a, b, i, tokens) {
    if (a.page !== b.page) {
      pageOpeners.push(b);
    }
    return 1;
  });
  util.timelog(name, 'detect and mark repeat headers and footers');
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
      if (Math.abs(parseInt(a.positionInfo.bottom) - extreme.extreme) < 2) {
        extremeSequence.push(a);
        if (!(Math.abs(parseInt(b.positionInfo.bottom) - extreme.extreme) < 2)) {
          extremeSequences.push(extremeSequence);
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
            dataWriter.write(name, 'partDetection', 'repeat header/footer:');
            for (t = _u = 0, _ref3 = a.length - 1; 0 <= _ref3 ? _u <= _ref3 : _u >= _ref3; t = 0 <= _ref3 ? ++_u : --_u) {
              a[t].fluff = true;
              b[t].fluff = true;
            }
            repeatSequence += 1;
          }
        }
      }
      if (!(repeatSequence > 0)) {
        logging.cond('no repeat ' + extreme.goalName + ' ' + 'detected in article' + ' ' + 'in pass' + ' for ' + (physicalPageSide === 0 ? 'even pages' : 'odd pages'), 'partDetection');
      } else {
        logging.cond(repeatSequence + ' ' + 'repeat' + ' ' + extreme.goalName + 's' + ' ' + 'detected in article' + ' ' + 'in pass' + ' ' + (physicalPageSide === 0 ? 'even pages' : 'odd pages'), 'partDetection');
      }
    }
  }
  dataWriter.write(name, 'partDetection', 'bottom extreme is ' + bottom.extreme);
  for (_v = 0, _len9 = tokens.length; _v < _len9; _v++) {
    token = tokens[_v];
    if (parseInt(token.page) === 1) {
      if (Math.abs(parseInt(token.positionInfo.bottom) - bottom.extreme) < 2) {
        dataWriter.write(name, 'partDetection', '1st page non-repeat footer text detected: ' + token.text);
        token.fluff = true;
      }
    }
  }
  util.timelog(name, 'detect and mark repeat headers and footers');
  titleAndAbstract(name, tokens);
  filtered = [];
  for (t = _w = 0, _ref4 = tokens.length - 1; 0 <= _ref4 ? _w <= _ref4 : _w >= _ref4; t = 0 <= _ref4 ? ++_w : --_w) {
    if (tokens[t].fluff == null) {
      filtered.push(tokens[t]);
    } else {

    }
  }
  tokens = filtered;
  util.timelog(name, 'basic handle line and paragraph beginnings');
  /*
  util.timelog 'making copy'
  tokens = JSON.parse(JSON.stringify(tokens))
  util.timelog 'making copy'
  */

  lineOpeners = [];
  lineOpenersForStats = [];
  lineSpaces = [];
  util.first(tokens).lineOpener = true;
  for (i = _x = 1, _ref5 = tokens.length - 1; 1 <= _ref5 ? _x <= _ref5 : _x >= _ref5; i = 1 <= _ref5 ? ++_x : --_x) {
    a = tokens[i - 1];
    b = tokens[i];
    if (parseFloat(b.positionInfo.bottom) > parseFloat(a.positionInfo.bottom) + 100) {
      a.lineCloser = true;
      b.lineOpener = true;
      a.columnCloser = true;
      b.columnOpener = true;
      lineOpeners.push(i);
      lineOpenersForStats.push(parseFloat(b.positionInfo.left));
    } else {
      if (parseFloat(b.positionInfo.bottom) + 5 < parseFloat(a.positionInfo.bottom)) {
        a.lineCloser = true;
        b.lineOpener = true;
        lineOpeners.push(i);
        lineOpenersForStats.push(parseFloat(b.positionInfo.left));
        lineSpaces.push(parseFloat(a.positionInfo.bottom) - parseFloat(b.positionInfo.bottom));
      }
    }
    if (b.lineOpener) {
      if (b.text === 'References') {
        logging.logGreen("has indentation change and preceded by " + a.text);
      }
    }
  }
  lineSpaceDistribution = analytic.generateDistribution(lineSpaces);
  newLineThreshold = parseFloat(util.first(lineSpaceDistribution).key) + 1;
  dataWriter.write(name, 'stats', "ordinary new line space set to the document's most common line space of " + newLineThreshold);
  util.last(tokens).lineCloser = true;
  for (i = _y = 1, _ref6 = lineOpeners.length - 1 - 1; 1 <= _ref6 ? _y <= _ref6 : _y >= _ref6; i = 1 <= _ref6 ? ++_y : --_y) {
    currOpener = tokens[lineOpeners[i]];
    prevOpener = tokens[lineOpeners[i - 1]];
    nextOpener = tokens[lineOpeners[i + 1]];
    prevToken = tokens[lineOpeners[i] - 1];
    if (currOpener.text === 'References') {
      logging.logYellow("REFERENCES");
    }
    if (currOpener.meta === 'title') {
      continue;
    }
    if (parseInt(currOpener.positionInfo.left) > parseInt(prevOpener.positionInfo.left)) {
      if (currOpener.text === 'References') {
        logging.logYellow("has indentation change and preceded by " + prevToken.text + ". Metatypes are: " + currOpener.metaType + ", " + prevToken.metaType);
      }
      if (currOpener.columnOpener) {
        if (parseInt(currOpener.positionInfo.left) > parseInt(nextOpener.positionInfo.left)) {
          currOpener.paragraphOpener = true;
          prevToken.paragraphCloser = true;
        }
      } else {
        if (currOpener.text === 'References') {
          logging.logYellow("is paragraph opener");
        }
        currOpener.paragraphOpener = true;
        prevToken.paragraphCloser = true;
      }
    }
    if (parseFloat(currOpener.positionInfo.bottom) + newLineThreshold < parseFloat(prevOpener.positionInfo.bottom) - 1) {
      currOpener.paragraphOpener = true;
      prevToken.paragraphCloser = true;
    }
  }
  util.timelog(name, 'basic handle line and paragraph beginnings');
  lastOpenerIndex = 0;
  paragraphs = [];
  for (i = _z = 0, _ref7 = tokens.length - 1; 0 <= _ref7 ? _z <= _ref7 : _z >= _ref7; i = 0 <= _ref7 ? ++_z : --_z) {
    if (tokens[i].paragraphOpener) {
      paragraphs.push({
        'length': i - lastOpenerIndex,
        'opener': tokens[i]
      });
      lastOpenerIndex = i;
    }
  }
  dataWriter.write(name, 'stats', "detected " + paragraphs.length + " paragraphs");
  dataWriter.write(name, 'stats', "number of pages in input document: " + (parseInt(util.last(tokens).page)));
  paragraphsRatio = paragraphs.length / parseInt(util.last(tokens).page);
  averageParagraphLength = analytic.average(paragraphs, function(a) {
    return a.length;
  });
  dataWriter.write(name, 'stats', "paragraphs to pages ratio: " + paragraphsRatio);
  dataWriter.write(name, 'stats', "average paragraph length:  " + averageParagraphLength);
  lineOpenersDistribution = analytic.generateDistribution(lineOpenersForStats);
  for (_aa = 0, _len10 = lineOpenersDistribution.length; _aa < _len10; _aa++) {
    entry = lineOpenersDistribution[_aa];
    logging.cond("line beginnings on left position " + entry.key + " - detected " + entry.val + " times", 'basicParse');
  }
  /*
  paragraphLengthsDistribution = analytic.generateDistribution(paragraphLengths)
  for entry in paragraphLengthsDistribution
   console.log """paragraph length of #{entry.key} tokens - detected #{entry.val} times"""
  */

  addStyleSeparationDelimiter = function(i, tokens) {
    var newDelimiter;
    a = tokens[i];
    newDelimiter = {
      'metaType': 'delimiter'
    };
    newDelimiter.styles = a.styles;
    newDelimiter.finalStyles = a.finalStyles;
    newDelimiter.page = a.page;
    newDelimiter.meta = a.meta;
    return tokens.splice(i, 0, newDelimiter);
  };
  tokens.reduce(function(a, b, i, tokens) {
    if (!a.lineCloser) {
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
  for (_ab = 0, _len11 = tokens.length; _ab < _len11; _ab++) {
    token = tokens[_ab];
    if (token.text === 'run.') {
      logging.logYellow("run still here");
    }
    if (token.text === 'References') {
      logging.logYellow("Referencse still here");
    }
  }
  docLogger.info(tokens.length);
  iterator(tokens, function(a, b, i, tokens) {
    var newDelimiter;
    if (b.lineOpener) {
      if (a.lineCloser) {
        if (b.text === 'References') {
          logging.logYellow("@References");
        }
        if (a.metaType === 'regular') {
          if (util.endsWith(a.text, '-')) {
            a.text = a.text.slice(0, -1);
            a.text = a.text.concat(b.text);
            tokens.splice(i, 1);
            return 0;
          } else {
            if (a.text === 'run.') {
              logging.logYellow("not Hyphen");
            }
            newDelimiter = {
              'metaType': 'delimiter'
            };
            newDelimiter.styles = a.styles;
            newDelimiter.finalStyles = a.finalStyles;
            newDelimiter.page = a.page;
            newDelimiter.meta = a.meta;
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
      a.paragraphOpener = b.paragraphOpener;
      a.paragraphCloser = b.paragraphCloser;
      tokens.splice(index, 1);
      return 0;
    }
    return 1;
  });
  for (_ac = 0, _len12 = tokens.length; _ac < _len12; _ac++) {
    token = tokens[_ac];
    if (token.text === 'run.References') {
      logging.logYellow("run. and References were united now");
    }
  }
  util.timelog(name, 'Extraction from html stage A');
  util.timelog(name, 'ID seeding');
  id = 0;
  for (_ad = 0, _len13 = tokens.length; _ad < _len13; _ad++) {
    token = tokens[_ad];
    token.id = id;
    id += 1;
  }
  util.timelog(name, 'ID seeding');
  if (createIndex) {
    textIndex = [];
    for (_ae = 0, _len14 = tokens.length; _ae < _len14; _ae++) {
      token = tokens[_ae];
      if (token.metaType === 'regular') {
        textIndex.push({
          text: token.text,
          id: token.id
        });
      }
    }
    util.timelog(name, 'Index creation');
    textIndex.sort(function(a, b) {
      if (a.text > b.text) {
        return 1;
      } else {
        return -1;
      }
    });
    util.timelog(name, 'Index creation');
  }
  for (_af = 0, _len15 = tokens.length; _af < _len15; _af++) {
    token = tokens[_af];
    if (token.metaType === 'regular') {
      token["case"] = 'undetermined';
      if (ctype.testWeakUpperCase(token.text)) {
        token["case"] = 'upper';
      }
      if (ctype.isUpperCaseChar(token.text.charAt(0))) {
        token["case"] = 'title';
      }
    }
  }
  headers(name, tokens);
  util.timelog(name, 'Sentence tokenizing');
  connect_token_group = function(_arg) {
    var group, token;
    group = _arg.group, token = _arg.token;
    return group.push(token);
  };
  abbreviations = 0;
  groups = [];
  group = [];
  for (t = _ag = 0, _len16 = tokens.length; _ag < _len16; t = ++_ag) {
    token = tokens[t];
    if (token.metaType === 'regular') {
      connect_token_group({
        group: group,
        token: token
      });
      if (sentenceSplitter.endOfSentence(tokens, t)) {
        groups.push(group);
        group = [];
      }
    }
  }
  if (group.length !== 0) {
    groups.push(group);
  }
  util.timelog(name, 'Sentence tokenizing');
  for (_ah = 0, _len17 = groups.length; _ah < _len17; _ah++) {
    group = groups[_ah];
    sentence = '';
    for (_ai = 0, _len18 = group.length; _ai < _len18; _ai++) {
      token = group[_ai];
      if (token.text === 'run.References') {
        logging.logYellow("REFERENCES IN SENTENCE");
      }
      if ((_ref8 = token.meta) === 'title' || _ref8 === 'abstract') {
        continue;
      }
      sentence += token.text + ' ';
    }
    if (sentence.length === 0) {
      continue;
    }
    if (group[group.length - 1].paragraphCloser) {
      sentence += '\n';
    }
    dataWriter.write(name, 'sentences', sentence);
  }
  metaTypeLog = function(type) {
    var text, _aj, _len19;
    text = '';
    for (_aj = 0, _len19 = tokens.length; _aj < _len19; _aj++) {
      token = tokens[_aj];
      if (token.meta === type) {
        switch (token.metaType) {
          case 'regular':
            text += token.text + ' ';
        }
      }
    }
    if (text.length > 0) {
      dataWriter.write(name, type, text);
      return true;
    } else {
      console.warn("cannot data-write " + type + " because no tokens are marked as " + type);
      return false;
    }
  };
  metaTypeLog('abstract');
  metaTypeLog('title');
  if (mode === 'basic') {
    callback(null, res, tokens, name, docLogger);
    return;
  }
  documentQuantifiers = {};
  documentQuantifiers['sentences'] = groups.length;
  documentQuantifiers['period-trailed-abbreviations'] = abbreviations;
  console.dir(documentQuantifiers);
  util.timelog(name, 'Markers visualization');
  docSieve = markers.createDocumentSieve(markers.baseSieve);
  markSentence = function(sentenceIdx) {
    var marker, matchedMarkers, _aj, _ak, _len19, _len20;
    sentence = groups[sentenceIdx];
    matchedMarkers = [];
    if (sentence != null) {
      for (_aj = 0, _len19 = sentence.length; _aj < _len19; _aj++) {
        token = sentence[_aj];
        if (token.metaType !== 'delimiter') {
          for (_ak = 0, _len20 = docSieve.length; _ak < _len20; _ak++) {
            marker = docSieve[_ak];
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
        util.timelog(name, 'Markers visualization');
        req.session.tokens = tokens;
        return callback();
      }
    } else {
      console.error('zero length sentence registered');
      console.error(sentenceIdx);
      console.error(groups.length);
      return console.error(name);
    }
  };
  markSentence(0);
  for (_aj = 0, _len19 = tokens.length; _aj < _len19; _aj++) {
    token = tokens[_aj];
    if (token.page == null) {
      throw "Internal Error - token is missing page number";
    }
  }
  deriveStructure(tokens);
  deriveStructureWithValues(tokens);
  if (mode === 'all') {
    callback(res, tokens, name, docLogger);
  }
};

exports.generateFromHtml = generateFromHtml;

done = function(error, res, tokens, name, docLogger) {
  var chunkRespond, chunkResponse, serializedTokens, shutdown;
  shutdown = function() {
    var compare;
    util.closeDocLogger(docLogger);
    dataWriter.close(name);
    compare = require('../compare/get');
    compare.diff(name, 'timers');
    return setTimeout((function() {
      return compare.diff(name, 'timers');
    }), 3000);
  };
  if (error != null) {
    res.writeHead(505);
    res.write(error);
    res.end();
    shutdown();
    return;
  }
  chunkResponse = true;
  chunkRespond = function(payload, res) {
    var chunk, i, maxChunkSize, sentSize, _i, _ref;
    sentSize = 0;
    maxChunkSize = 65536;
    for (i = _i = 0, _ref = payload.length / maxChunkSize; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      chunk = payload.substring(i * maxChunkSize, Math.min((i + 1) * maxChunkSize, payload.length));
      logging.cond("sending chunk of length " + chunk.length, 'communication');
      sentSize += chunk.length;
      res.write(chunk);
    }
    res.end();
    return assert.equal(sentSize, payload.length, "payload chunking did not send entire payload");
  };
  if (tokens != null) {
    if (tokens.length > 0) {
      util.timelog(name, 'pickling');
      serializedTokens = JSON.stringify(tokens);
      dataWriter.write(name, 'stats', "" + tokens.length + " tokens pickled into " + serializedTokens.length + " long bytes stream");
      dataWriter.write(name, 'stats', "pickled size to tokens ratio: " + (parseFloat(serializedTokens.length) / tokens.length));
      util.timelog(name, 'pickling');
      if (chunkResponse) {
        chunkRespond(serializedTokens, res);
      } else {
        res.end(serializedTokens);
      }
      shutdown();
      return;
    }
  }
  res.send(500);
  return shutdown();
};

exports.go = function(req, name, input, res, docLogger) {
  logging.cond("about to generate tokens", 'progress');
  return generateFromHtml(req, name, input, res, docLogger, done);
};

exports.originalGo = function(req, name, res, docLogger) {
  var riak, storage;
  storage = require('../src/storage/storage');
  require('stream');
  riak = require('riak-js').getClient({
    host: "localhost",
    port: "8098"
  });
  util.timelog(name, 'checking data store for cached tokens');
  return storage.fetch('tokens', name, function(cachedSerializedTokens) {
    util.timelog(name, 'checking data store for cached tokens');
    if (cachedSerializedTokens) {
      console.log('cached tokens found in datastore');
      req.session.serializedTokens = cachedSerializedTokens;
      return output.serveViewerTemplate(res, docLogger);
    } else {
      console.log('no cached tokens found in datastore');
      return generateFromHtml(req, name, res, docLogger, function() {
        return output.serveViewerTemplate(res, docLogger);
      });
    }
  });
};
