// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

  const _ = require('lodash');

  const varattu = /[",.=]|%%%/;
  const numero = /[0-9]/;

  function sisaltaaErikoismerkkeja(x) {
    if(varattu.test(x)) return false;
    for(let i = 0, n = x.length; i < n; i++) {
      const m = x[i];
      if (!numero.test(m) && m.toLowerCase() === m.toUpperCase()) return true;
    }
    return false;
  }

  const erikoismerkki = {
	  test(x) {
		  return !varattu.test(x) && !numero.test(x) && x.toLowerCase() === x.toUpperCase();
	  }
  };

  const merkki = {
	  test(x){
	  	return !varattu.test(x) && !erikoismerkki.test(x);
  	}
  };

  const count = (l, pred) => {
    if (typeof pred !== 'function') pred = x => x === pred;
    return _.filter(l, pred).length;
  };

  const flatJoin = x => _.flattenDeep(x).join('');

  const kasittele = {
    funktioluonti(d) {
      return { tyyppi: 'funktioluonti', arvo: d[0].arvo, parametrit: (d[4] || []).map(_.property('arvo')) };
    },
    funktiokutsu(d) {
      return { tyyppi: 'funktiokutsu', arvo: d[0].arvo, argumentit: d[4] || [] };
    }
  };

var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "main", "symbols": ["runko"], "postprocess": _.head},
    {"name": "runko", "symbols": ["ilmaisujoukko"], "postprocess": d => d[0]},
    {"name": "ilmaisujoukko", "symbols": ["ilmaisu"]},
    {"name": "ilmaisujoukko", "symbols": ["ilmaisu", "_", {"literal":"\n"}, "_", "ilmaisujoukko"], "postprocess": d => [d[0]].concat(d[4])},
    {"name": "argumenttilista", "symbols": ["ilmaisu"]},
    {"name": "argumenttilista", "symbols": ["ilmaisu", "_", {"literal":","}, "_", "argumenttilista"], "postprocess": d => [d[0]].concat(d[4])},
    {"name": "parametrilista", "symbols": ["muuttuja"]},
    {"name": "parametrilista", "symbols": ["muuttuja", "_", {"literal":","}, "_", "parametrilista"], "postprocess": d => [d[0]].concat(d[4])},
    {"name": "ilmaisu", "symbols": ["funktioluonti"], "postprocess": _.head},
    {"name": "ilmaisu", "symbols": ["funktiokutsu"], "postprocess": _.head},
    {"name": "ilmaisu", "symbols": ["muuttuja"], "postprocess": _.head},
    {"name": "ilmaisu", "symbols": ["luku"], "postprocess": _.head},
    {"name": "funktioluonti$ebnf$1", "symbols": ["parametrilista"], "postprocess": id},
    {"name": "funktioluonti$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "funktioluonti", "symbols": ["muuttuja", "_", {"literal":"("}, "_", "funktioluonti$ebnf$1", "_", {"literal":")"}, "_", {"literal":"="}], "postprocess": kasittele.funktioluonti},
    {"name": "funktiokutsu$ebnf$1", "symbols": ["argumenttilista"], "postprocess": id},
    {"name": "funktiokutsu$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "funktiokutsu", "symbols": ["muuttuja", "_", {"literal":"("}, "_", "funktiokutsu$ebnf$1", "_", {"literal":")"}], "postprocess": kasittele.funktiokutsu},
    {"name": "muuttuja", "symbols": ["merkkijono"], "postprocess": d => ({ tyyppi: 'muuttuja', arvo: d[0] })},
    {"name": "erikoismerkkijono$ebnf$1", "symbols": []},
    {"name": "erikoismerkkijono$ebnf$1$subexpression$1", "symbols": [merkki]},
    {"name": "erikoismerkkijono$ebnf$1$subexpression$1", "symbols": [erikoismerkki]},
    {"name": "erikoismerkkijono$ebnf$1", "symbols": ["erikoismerkkijono$ebnf$1", "erikoismerkkijono$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "erikoismerkkijono", "symbols": ["erikoismerkkijono$ebnf$1"], "postprocess": 
        function (d, pos, reject) {
          const res = flatJoin(d);
          return sisaltaaErikoismerkkeja(res) ? res : reject;
        }
        },
    {"name": "merkkijono$ebnf$1", "symbols": []},
    {"name": "merkkijono$ebnf$1", "symbols": ["merkkijono$ebnf$1", merkki], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "merkkijono", "symbols": ["merkkijono$ebnf$1"], "postprocess": 
        function (d, pos, reject) {
          const res = flatJoin(d);
          // Tarkistetaan että merkkijono sisältää jotain
          // muutakin kuin numeroita, muutoin kyseessä on tavallinen luku
          return _.every(res, r => /[0-9.]/.test(r)) ? reject : res;
        }
        },
    {"name": "luku$ebnf$1", "symbols": [numero]},
    {"name": "luku$ebnf$1", "symbols": ["luku$ebnf$1", numero], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "luku", "symbols": ["luku$ebnf$1"], "postprocess": d => ({ tyyppi: 'numero', arvo: parseInt(d[0], 10) })},
    {"name": "luku$ebnf$2", "symbols": [numero]},
    {"name": "luku$ebnf$2", "symbols": ["luku$ebnf$2", numero], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "luku$ebnf$3", "symbols": [numero]},
    {"name": "luku$ebnf$3", "symbols": ["luku$ebnf$3", numero], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "luku", "symbols": ["luku$ebnf$2", {"literal":"."}, "luku$ebnf$3"], "postprocess": d => ({ tyyppi: 'numero', arvo: parseFloat(flatJoin(d)) })}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
