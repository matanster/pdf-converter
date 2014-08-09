// Generated by CoffeeScript 1.6.3
var diffFormat, docsDataDir, dtldiff, fs, getPair, intraLineFormat, iterator, jsdiff, logging, pad, replaceAll, util, wrappedWordsDiff;

fs = require('fs');

util = require('../util/util');

logging = require('../util/logging');

jsdiff = require('diff');

dtldiff = require('dtl');

docsDataDir = require('../data/dataWriter').docsDataDir;

getPair = function(inputFileName, dataType) {
  var docDataDir, relevantDataFiles;
  docDataDir = docsDataDir + '/' + inputFileName + '/';
  relevantDataFiles = fs.readdirSync(docDataDir).filter(function(dataFileName) {
    return dataFileName.indexOf(dataType) === 0;
  });
  if (relevantDataFiles.length > 1) {
    relevantDataFiles.sort().reverse();
    return relevantDataFiles.slice(0, 2).map(function(dataFileName) {
      return docDataDir + dataFileName;
    });
  }
  return void 0;
};

pad = function(string) {
  var trimmed;
  trimmed = util.trim(string, '\n');
  return string.split('\n').join('\n\n');
};

iterator = function(items, func) {
  var curr, i, next, _results;
  i = 0;
  _results = [];
  while (i < items.length) {
    curr = items[i];
    if (i + 1 < items.length) {
      next = items[i + 1];
    }
    _results.push(i += func(curr, next));
  }
  return _results;
};

diffFormat = function(diffDescriptor) {
  if (diffDescriptor.added) {
    return '+ ' + diffDescriptor.value;
  }
  if (diffDescriptor.removed) {
    return '- ' + diffDescriptor.value;
  }
};

intraLineFormat = function(diffDescriptor) {
  if ((!diffDescriptor.added) && (!diffDescriptor.removed)) {
    return diffDescriptor.value;
  }
  if (diffDescriptor.added) {
    return '<+>' + diffDescriptor.value + '</+>';
  }
  if (diffDescriptor.removed) {
    return '<->' + diffDescriptor.value + '</->';
  }
};

replaceAll = function(string, from, to) {
  if (string.indexOf(from) !== -1) {
    return replaceAll(string.replace(from, to), from, to);
  } else {
    return string;
  }
};

wrappedWordsDiff = function(string1, string2) {
  var newlineReplacer, replaceDoubleSpaces, replacements, spaceReplacer, string1r, string2r, transform, wordsDiff;
  spaceReplacer = '\u9820';
  newlineReplacer = '\u9819';
  replacements = [
    {
      orig: '\n',
      to: newlineReplacer
    }, {
      orig: ' ',
      to: spaceReplacer
    }
  ];
  replaceDoubleSpaces = function(str) {
    if (str.indexOf('  ') > -1) {
      return replaceDoubleSpaces(replaceAll(str, '  ', ' ' + spaceReplacer + ' '));
    } else {
      return str;
    }
  };
  transform = function(string) {
    var returnStr;
    returnStr = replaceDoubleSpaces(string);
    return replaceAll(returnStr, '\n', ' ' + newlineReplacer + ' ');
  };
  string1r = transform(string1);
  string2r = transform(string2);
  wordsDiff = jsdiff.diffWords(string1r, string2r);
  wordsDiff.forEach(function(diffDescriptor) {
    return replacements.forEach(function(replacer) {
      var reverted;
      reverted = replaceAll(diffDescriptor.value, replacer.to + ' ', replacer.orig);
      if (reverted.indexOf(replacer.to) !== -1) {
        logging.logRed("" + replacer.to);
        logging.logRed("bug produced: " + reverted);
      }
      return diffDescriptor.value = reverted;
    });
  });
  return wordsDiff;
};

exports.diff = function(inputFileName, dataType) {
  var filesContent, finalDiff, formatedWordSequence, linesDiff, output, pair;
  logging.logYellow('before diff');
  pair = ['/home/matan/ingi/repos/back-end-js/tmp/1.out', '/home/matan/ingi/repos/back-end-js/tmp/2.out'];
  if (pair != null) {
    filesContent = pair.map(function(file) {
      return fs.readFileSync(file, {
        encoding: 'utf8'
      });
    });
    linesDiff = jsdiff.diffWords(filesContent[0], filesContent[1]).filter(function(diffDescriptor) {
      return diffDescriptor.added || diffDescriptor.removed;
    });
    console.dir(linesDiff);
    finalDiff = [];
    output = '';
    formatedWordSequence = linesDiff.map(function(diffDescriptor) {
      return output += intraLineFormat(diffDescriptor);
    });
    logging.logGreen(output);
    console.log(finalDiff.join('\n'));
    return logging.logYellow('after diff');
  }
};
