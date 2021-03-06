// Generated by CoffeeScript 1.6.3
var Token, TokenGroup, logging, util;

util = require('./util/util');

logging = require('./util/logging');

Token = (function() {
  var types;

  types = ['word', 'punctuation,', 'superscriptComment'];

  function Token(type, content) {
    if (!util.isAnyOf(type, types)) {
      util.objectViolation('invalid token type encountered on token creation');
    }
    this.type = type;
    this.content = content;
    this.partOf = [];
  }

  return Token;

})();

TokenGroup = (function() {
  var types;

  types = ['section', 'heading', 'sentence', 'paragraph', 'list', 'title'];

  function TokenGroup() {
    this.has = [];
    this.partOf = [];
  }

  TokenGroup.prototype.add = function(token) {
    if (!(token instanceof Token || token instanceof TokenGroup)) {
      util.objectViolation('TokenGroup can only include Token or TokenGroup objects');
    }
    return this.has.push(token);
  };

  TokenGroup.prototype.getAll = function() {
    return this.has;
  };

  TokenGroup.prototype.setType = function(type) {
    if (!util.isAnyOf(type, types)) {
      util.objectViolation('cannot assign invalid TokenGroup type to TokenGroup');
    }
    return this.type = type;
  };

  TokenGroup.prototype.getType = function() {
    return this.type;
  };

  return TokenGroup;

})();

/*

Move to unit tests stuff like this:

t = new Token('word')
g = new TokenGroup
g.add(t)
g.add(g)
logging.log(g.getType())
g.setType("sentence")
logging.log(g.getType())
logging.log(g.getAll())
logging.log('done')
*/

