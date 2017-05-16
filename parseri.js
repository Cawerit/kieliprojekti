const
  nearley         = require('nearley'),
  kielioppi       = require('./grammar.js'),
  esikasittele    = require('./esitokenisointi.js');

/**
 * Parseri on aika turha.
 **/

function parse(koodi) {
  const
    parseri = new nearley.Parser(kielioppi.ParserRules, kielioppi.ParserStart);

  const esikasitelty = esikasittele(koodi);

  return parseri.feed(esikasitelty).results[0];
}

module.exports = parse;
