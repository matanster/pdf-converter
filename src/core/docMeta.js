// Generated by CoffeeScript 1.6.3
var storeCmdOutput;

storeCmdOutput = require('../util/storeCmdOutput');

exports.storePdfMetaData = function(context, localCopy, docLogger) {
  var params;
  params = {
    execCommand: 'pdfinfo -meta',
    dataType: 'pdfMeta',
    description: 'Getting pdf file metadata using pdfinfo'
  };
  return storeCmdOutput(context, localCopy, docLogger, params);
};

exports.storePdfFontsSummary = function(context, localCopy, docLogger) {
  var params;
  params = {
    execCommand: 'pdffonts',
    dataType: 'pdfFonts',
    description: 'Getting pdf fonts summary using pdffonts (1 of 2)'
  };
  return storeCmdOutput(context, localCopy, docLogger, params);
  /* TODO: re-enable this additional font data logging, 
  params =  
    execCommand : 'pdffonts -subst', 
    dataType    : 'pdfFonts',
    description : 'Getting pdf fonts summary using pdffonts (2 of 2)'
  
  storeCmdOutput(context, localCopy, docLogger, params)
  */

};
