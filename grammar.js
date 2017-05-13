// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

  const _ = require('lodash');

  const varattu = /[",.=; ]|%%%|\s|\t|\n|\r|infiksi/;
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

  const kasitteleParametrit = p =>  (p || []).map(_.property('arvo'));


 const kasitteleilmaisujoukko = d => [d[0]].concat(d[4]); var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "main$ebnf$1", "symbols": []},
    {"name": "main$ebnf$1", "symbols": ["main$ebnf$1", "br"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "main", "symbols": ["runko", "main$ebnf$1"], "postprocess": _.head},
    {"name": "runko$string$1", "symbols": [{"literal":"%"}, {"literal":"%"}, {"literal":"%"}, {"literal":"{"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "runko$string$2", "symbols": [{"literal":"}"}, {"literal":"%"}, {"literal":"%"}, {"literal":"%"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "runko", "symbols": ["runko$string$1", "_", "ilmaisujoukko", "_", "runko$string$2"], "postprocess": d => d[2]},
    {"name": "ilmaisujoukko", "symbols": ["ilmaisu"]},
    {"name": "ilmaisujoukko$string$1", "symbols": [{"literal":"%"}, {"literal":"%"}, {"literal":"%"}, {"literal":";"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "ilmaisujoukko", "symbols": ["asetus", "_", "ilmaisujoukko$string$1", "_", "ilmaisujoukko"], "postprocess": kasitteleilmaisujoukko},
    {"name": "ilmaisujoukko$string$2", "symbols": [{"literal":"%"}, {"literal":"%"}, {"literal":"%"}, {"literal":";"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "ilmaisujoukko", "symbols": ["infiksifunktioluonti", "_", "ilmaisujoukko$string$2", "_", "ilmaisujoukko"], "postprocess": kasitteleilmaisujoukko},
    {"name": "argumenttilista", "symbols": ["ilmaisu"]},
    {"name": "argumenttilista", "symbols": ["ilmaisu", "_", {"literal":","}, "_", "argumenttilista"], "postprocess": d => [d[0]].concat(d[4])},
    {"name": "parametrilista", "symbols": ["muuttuja"]},
    {"name": "parametrilista", "symbols": ["muuttuja", "_", {"literal":","}, "_", "parametrilista"], "postprocess": d => [d[0]].concat(d[4])},
    {"name": "asetus", "symbols": ["funktioluonti"], "postprocess": _.head},
    {"name": "asetus", "symbols": ["muuttujaluonti"], "postprocess": _.head},
    {"name": "ilmaisu", "symbols": ["ilmaisuEiInfiksi"], "postprocess": _.head},
    {"name": "ilmaisu", "symbols": ["infiksifunktiokutsu"], "postprocess": _.head},
    {"name": "ilmaisuEiInfiksi", "symbols": ["funktioluonti"], "postprocess": _.head},
    {"name": "ilmaisuEiInfiksi", "symbols": ["funktiokutsu"], "postprocess": _.head},
    {"name": "ilmaisuEiInfiksi", "symbols": ["muuttuja"], "postprocess": _.head},
    {"name": "ilmaisuEiInfiksi", "symbols": ["luku"], "postprocess": _.head},
    {"name": "infiksifunktioluonti$string$1", "symbols": [{"literal":"i"}, {"literal":"n"}, {"literal":"f"}, {"literal":"i"}, {"literal":"k"}, {"literal":"s"}, {"literal":"i"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "infiksifunktioluonti$ebnf$1", "symbols": ["parametrilista"], "postprocess": id},
    {"name": "infiksifunktioluonti$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "infiksifunktioluonti", "symbols": ["infiksifunktioluonti$string$1", "__", "luku", "__", "erikoismerkkijono", "_", {"literal":"("}, "_", "infiksifunktioluonti$ebnf$1", "_", {"literal":")"}, "_", {"literal":"="}, "_", "runko"], "postprocess":  d => {
            const [, , precedence, , nimi, , , , parametrit, , , , , , runko] = d;
            return {
              tyyppi: 'infiksifunktioluonti',
              precedence: precedence.arvo,
              arvo: nimi,
              parametrit,
              runko
            };
        }},
    {"name": "funktioluonti$ebnf$1", "symbols": ["parametrilista"], "postprocess": id},
    {"name": "funktioluonti$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "funktioluonti", "symbols": ["muuttuja", "_", {"literal":"("}, "_", "funktioluonti$ebnf$1", "_", {"literal":")"}, "_", {"literal":"="}, "_", "runko"], "postprocess":  d => {
          return {
            tyyppi: 'funktioluonti',
            arvo: d[0].arvo,
            parametrit: kasitteleParametrit(d[4]),
            runko: d[10]
          };
        }},
    {"name": "muuttujaluonti", "symbols": ["muuttuja", "_", {"literal":"="}, "_", "runko"], "postprocess":  function(d, pos, reject) {
          const [nimi, , , , runko] = d;
          return {
            tyyppi: 'muuttujaluonti',
            arvo: nimi.arvo,
            runko: runko
          };
        }},
    {"name": "infiksifunktiokutsu", "symbols": ["ilmaisuEiInfiksi", "_", "erikoismerkkijono", "_", "ilmaisu"], "postprocess":  d => {
            return {
              tyyppi: 'funktiokutsu',
              infiksi: true,
              arvo: d[2],
              argumentit: [d[0], d[4]]
            };
        }},
    {"name": "funktiokutsu$ebnf$1", "symbols": ["argumenttilista"], "postprocess": id},
    {"name": "funktiokutsu$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "funktiokutsu", "symbols": ["muuttuja", "_", {"literal":"("}, "_", "funktiokutsu$ebnf$1", "_", {"literal":")"}], "postprocess":  d => {
          return { tyyppi: 'funktiokutsu', arvo: d[0].arvo, argumentit: d[4] || [] };
        }},
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
    {"name": "luku", "symbols": ["luku$ebnf$2", {"literal":"."}, "luku$ebnf$3"], "postprocess": d => ({ tyyppi: 'numero', arvo: parseFloat(flatJoin(d)) })},
    {"name": "br", "symbols": [/[\r\n]/]}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
