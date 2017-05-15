// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

  const _ = require('lodash');

  const varattu = /[",.=(){} ]|\s|\t|\n|\r|^infiksi$|^Tosi$|^Epätosi$/;
  const numero = /[0-9]/;

  const erikoismerkki = {
	  test(x) {
		  return !varattu.test(x) && !numero.test(x) && x !== '$' && x.toLowerCase() === x.toUpperCase();
	  }
  };

  function sisaltaaErikoismerkkeja(x) {
    if(varattu.test(x)) return false;
    for(let i = 0, n = x.length; i < n; i++) {
      const m = x[i];
      if (erikoismerkki.test(m)) return true;
    }
    return false;
  }

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

  // Apumuuttuja joka ottaa listan ensimmäisen alkion
  const
    fst = _.head,
    third = d => d[2];


 const kasitteleilmaisujoukko = d => [d[0]].concat(d[2]); 
 const kasitteleTotuusarvo = arvo => () => ({ tyyppi: 'totuusarvo', arvo }); var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "main", "symbols": ["runko"], "postprocess": fst},
    {"name": "runko", "symbols": [{"literal":"{"}, "_", "ilmaisujoukko", "_", {"literal":"}"}], "postprocess": third},
    {"name": "ilmaisujoukko", "symbols": ["ilmaisu"]},
    {"name": "ilmaisujoukko", "symbols": ["asetus", "__", "ilmaisujoukko"], "postprocess": kasitteleilmaisujoukko},
    {"name": "ilmaisujoukko", "symbols": ["infiksifunktioluonti", "__", "ilmaisujoukko"], "postprocess": kasitteleilmaisujoukko},
    {"name": "argumenttilista", "symbols": ["eiAsetus"]},
    {"name": "argumenttilista", "symbols": ["eiAsetus", "_", {"literal":","}, "_", "argumenttilista"], "postprocess": d => [d[0]].concat(d[4])},
    {"name": "parametrilista", "symbols": ["muuttuja"]},
    {"name": "parametrilista", "symbols": ["muuttuja", "_", {"literal":","}, "_", "parametrilista"], "postprocess": d => [d[0]].concat(d[4])},
    {"name": "ilmaisu", "symbols": ["asetus"], "postprocess": fst},
    {"name": "ilmaisu", "symbols": ["eiAsetus"], "postprocess": fst},
    {"name": "eiAsetus", "symbols": ["yksinkertainenIlmaisu"], "postprocess": fst},
    {"name": "eiAsetus", "symbols": ["infiksifunktiokutsu"], "postprocess": fst},
    {"name": "yksinkertainenIlmaisu", "symbols": ["laskettuArvo"], "postprocess": fst},
    {"name": "yksinkertainenIlmaisu", "symbols": ["luku"], "postprocess": fst},
    {"name": "yksinkertainenIlmaisu", "symbols": ["teksti"], "postprocess": fst},
    {"name": "yksinkertainenIlmaisu", "symbols": ["totuusarvo"], "postprocess": fst},
    {"name": "laskettuArvo", "symbols": ["funktiokutsu"], "postprocess": fst},
    {"name": "laskettuArvo", "symbols": ["lambda"], "postprocess": fst},
    {"name": "laskettuArvo", "symbols": ["muuttuja"], "postprocess": fst},
    {"name": "laskettuArvo", "symbols": [{"literal":"("}, "_", "infiksifunktio", "_", {"literal":")"}], "postprocess": third},
    {"name": "laskettuArvo", "symbols": [{"literal":"("}, "_", "eiAsetus", "_", {"literal":")"}], "postprocess": third},
    {"name": "asetus", "symbols": ["funktioluonti"], "postprocess": fst},
    {"name": "asetus", "symbols": ["muuttujaluonti"], "postprocess": fst},
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
    {"name": "lambda", "symbols": [{"literal":"{"}, "_", "ilmaisu", "_", {"literal":"}"}], "postprocess":  d => {
          return {
            tyyppi: 'lambda',
            arvo: null,
            parametrit: ['$$'],
            runko: d[2]
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
    {"name": "infiksifunktiokutsu", "symbols": ["yksinkertainenIlmaisu", "_", "infiksifunktio", "_", "ilmaisu"], "postprocess":  d => {
            return {
              tyyppi: 'funktiokutsu',
              infiksi: true,
              arvo: d[2].arvo,
              argumentit: [d[0], d[4]]
            };
        }},
    {"name": "funktiokutsu$ebnf$1", "symbols": ["argumenttilista"], "postprocess": id},
    {"name": "funktiokutsu$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "funktiokutsu", "symbols": ["laskettuArvo", "_", {"literal":"("}, "_", "funktiokutsu$ebnf$1", "_", {"literal":")"}], "postprocess":  d => {
          return { tyyppi: 'funktiokutsu', arvo: d[0], argumentit: d[4] || [] };
        }},
    {"name": "infiksifunktio", "symbols": ["erikoismerkkijono"], "postprocess": d => ({ tyyppi: 'infiksifunktio', arvo: d[0] })},
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
          return varattu.test(res) || _.every(res, r => /[0-9.]/.test(r)) ? reject : res;
        }
        },
    {"name": "teksti$ebnf$1", "symbols": []},
    {"name": "teksti$ebnf$1", "symbols": ["teksti$ebnf$1", "tekstiSisalto"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "teksti", "symbols": [{"literal":"\""}, "teksti$ebnf$1", {"literal":"\""}], "postprocess": d => ({ tyyppi: 'teksti', arvo: d[1].join('') })},
    {"name": "tekstiSisalto", "symbols": [/[^\\"]/], "postprocess": fst},
    {"name": "tekstiSisalto", "symbols": [{"literal":"\\"}, /["\\\/bfnrt]/], "postprocess": 
        function(d, pos, reject) {
          try {
            return JSON.parse('"' + d.join('') + '"');
          } catch(e) {
            return reject;
          }
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
    {"name": "totuusarvo$string$1", "symbols": [{"literal":"T"}, {"literal":"o"}, {"literal":"s"}, {"literal":"i"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "totuusarvo", "symbols": ["totuusarvo$string$1"], "postprocess": kasitteleTotuusarvo(true)},
    {"name": "totuusarvo$string$2", "symbols": [{"literal":"E"}, {"literal":"p"}, {"literal":"ä"}, {"literal":"t"}, {"literal":"o"}, {"literal":"s"}, {"literal":"i"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "totuusarvo", "symbols": ["totuusarvo$string$2"], "postprocess": kasitteleTotuusarvo(false)},
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
