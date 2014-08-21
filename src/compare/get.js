// Generated by CoffeeScript 1.6.3
var dataWriter, docsDataDir, dtldiff, fs, getPair, logging, rsplit, util;

fs = require('fs');

util = require('../util/util');

logging = require('../util/logging');

dtldiff = require('dtl');

dataWriter = require('../data/dataWriter');

docsDataDir = dataWriter.docsDataDir;

getPair = function(inputFileName, dataType) {
  var docDataDir, relevantSESs;
  docDataDir = docsDataDir + '/' + inputFileName + '/';
  relevantSESs = fs.readdirSync(docDataDir).filter(function(SESName) {
    return SESName.indexOf(dataType) === 0;
  });
  if (relevantSESs.length > 1) {
    relevantSESs.sort().reverse();
    return relevantSESs.slice(0, 2).map(function(SESName) {
      return docDataDir + SESName;
    });
  }
  return void 0;
};

rsplit = function(contentArray, delimiter) {
  var newArray;
  newArray = [];
  contentArray.forEach(function(contentUnit) {
    var split;
    if (contentUnit.indexOf(delimiter) === -1) {
      return newArray.push(contentUnit);
    } else {
      split = contentUnit.split(delimiter);
      split.reduce(function(prev, curr) {
        newArray.push(prev, delimiter);
        return curr;
      });
      newArray.push(split[split.length - 1]);
      return newArray = newArray.filter(function(item) {
        return item !== '';
      });
    }
  });
  return newArray;
};

exports.diff = function(context, dataType) {
  var SES, beefedArrays, contentArrays, diff, diffentry, differ, editDistance, filesContent, inputFileName, marks, pair, rawDiff, result, sequence, type, val, _i, _len;
  inputFileName = context.name;
  pair = getPair(inputFileName, dataType);
  if (pair == null) {
    return logging.logYellow("skipping diff for " + inputFileName + ", " + dataType + ", as could not figure or find document pair to diff");
  } else {
    filesContent = pair.map(function(file) {
      return fs.readFileSync(file, {
        encoding: 'utf8'
      });
    });
    result = "Shortest edit path \nfrom: " + pair[0] + "\nto:   " + pair[1] + "\n\n";
    if (filesContent[0] === filesContent[1]) {
      editDistance = 0;
    } else {
      contentArrays = filesContent.map(function(content) {
        return rsplit([content], ' ');
      });
      beefedArrays = contentArrays.map(function(contentArray) {
        return rsplit(contentArray, '\n');
      });
      differ = new dtldiff.Diff(beefedArrays[0], beefedArrays[1]);
      differ.compose();
      marks = {
        'add': '+',
        'del': '-',
        'common': 'C'
      };
      editDistance = differ.editdistance();
      rawDiff = differ.ses(marks);
      diff = [];
      sequence = {
        type: null
      };
      for (_i = 0, _len = rawDiff.length; _i < _len; _i++) {
        diffentry = rawDiff[_i];
        type = (Object.keys(diffentry))[0];
        val = diffentry[type];
        if (type === sequence.type) {
          sequence.vals.push(val);
        } else {
          if (sequence.type !== null) {
            diff.push(sequence);
          }
          sequence = {
            type: type,
            vals: [val]
          };
        }
      }
      diff.push(sequence);
      diff.filter(function(d) {
        return d.type !== 'C';
      }).forEach(function(d) {
        return result += d.type + d.vals.join('') + '\n';
      });
    }
    SES = dataWriter.getReadyName(inputFileName, "diff-" + dataType);
    fs.writeFile(SES, result);
    dataWriter.write(context, 'diffs', {
      docName: context.name,
      dataType: dataType,
      run1ID: 'TBD',
      run2ID: 'TBD',
      run1link: util.terminalClickableFileLink(pair[0]),
      run2link: util.terminalClickableFileLink(pair[0]),
      editDistance: editDistance,
      SESlink: util.terminalClickableFileLink(SES)
    });
    console.log("\nComparing the following " + (logging.italics(dataType)) + " output pair found " + (logging.italics('edit distance of ' + editDistance)));
    console.log("" + (pair.map(util.terminalClickableFileLink).join('\n')));
    return console.log("details at: " + (util.terminalClickableFileLink(SES)));
  }
};
