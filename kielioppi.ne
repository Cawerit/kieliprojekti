@builtin "whitespace.ne"
@{%
  const _ = require('lodash');

  const varattu = /[",.= ]|%%%|\s|\t|\n|\r|^infiksi$|^Tosi$|^Epätosi$/;
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

  // Apumuuttuja joka ottaa listan ensimmäisen alkion
  const fst = _.head;

%}


main -> runko {% fst %}

runko ->
  "%%%{" _ ilmaisujoukko _ "}%%%" {% d => d[2] %}

@{% const kasitteleilmaisujoukko = d => [d[0]].concat(d[2]); %}
ilmaisujoukko ->
  ilmaisu
  | asetus __ ilmaisujoukko {% kasitteleilmaisujoukko %}
  | infiksifunktioluonti __ ilmaisujoukko {% kasitteleilmaisujoukko %}

argumenttilista ->
  ilmaisu
  | ilmaisu _ "," _ argumenttilista {% d => [d[0]].concat(d[4]) %}

parametrilista ->
  muuttuja
  | muuttuja _ "," _ parametrilista {% d => [d[0]].concat(d[4]) %}

asetus ->
  funktioluonti     {% fst %}
  | muuttujaluonti  {% fst %}

ilmaisu ->
  ilmaisuEiInfiksi        {% fst %}
  | infiksifunktiokutsu   {% fst %}

ilmaisuEiInfiksi ->
  funktioluonti   {% fst %}
  | funktiokutsu  {% fst %}
  | muuttuja      {% fst %}
  | luku          {% fst %}
  | teksti        {% fst %}
  | totuusarvo    {% fst %}

infiksifunktioluonti ->
  "infiksi" __ luku __ erikoismerkkijono _ "(" _ parametrilista:? _ ")" _ "=" _ runko
  {% d => {
      const [, , precedence, , nimi, , , , parametrit, , , , , , runko] = d;
      return {
        tyyppi: 'infiksifunktioluonti',
        precedence: precedence.arvo,
        arvo: nimi,
        parametrit,
        runko
      };
  }%}

funktioluonti -> muuttuja _ "(" _ parametrilista:? _ ")" _ "=" _ runko
  {% d => {
    return {
      tyyppi: 'funktioluonti',
      arvo: d[0].arvo,
      parametrit: kasitteleParametrit(d[4]),
      runko: d[10]
    };
  }%}

muuttujaluonti ->
  muuttuja _ "=" _ runko
  {% function(d, pos, reject) {
    const [nimi, , , , runko] = d;
    return {
      tyyppi: 'muuttujaluonti',
      arvo: nimi.arvo,
      runko: runko
    };
  }%}

infiksifunktiokutsu -> ilmaisuEiInfiksi _ erikoismerkkijono _ ilmaisu
  {% d => {
      return {
        tyyppi: 'funktiokutsu',
        infiksi: true,
        arvo: d[2],
        argumentit: [d[0], d[4]]
      };
  }%}

funktiokutsu -> muuttuja _ "(" _ argumenttilista:? _ ")"
  {% d => {
    return { tyyppi: 'funktiokutsu', arvo: d[0].arvo, argumentit: d[4] || [] };
  }%}

muuttuja -> merkkijono {% d => ({ tyyppi: 'muuttuja', arvo: d[0] }) %}

# Erikoismerkkejä käytetään infiksifunktioiden nimissä.
# Erikoismerkkijono on muuten samanlainen kuin merkkijono, mutta sen tulee
# sisältää myös vähintään yksi erikoismerkki
erikoismerkkijono -> (%merkki|%erikoismerkki):* {%
  function (d, pos, reject) {
    const res = flatJoin(d);
    return sisaltaaErikoismerkkeja(res) ? res : reject;
  }
%}

merkkijono -> %merkki:* {%
  function (d, pos, reject) {
    const res = flatJoin(d);
    // Tarkistetaan että merkkijono sisältää jotain
    // muutakin kuin numeroita, muutoin kyseessä on tavallinen luku
    return varattu.test(res) || _.every(res, r => /[0-9.]/.test(r)) ? reject : res;
  }
%}

#teksti -> dqstring {% d => ({ tyyppi: 'teksti', arvo: d[0] }) %}

teksti -> "\"" tekstiSisalto:* "\"" {% d => ({ tyyppi: 'teksti', arvo: d[1].join('') }) %}

tekstiSisalto ->
    [^\\"] {% fst %}
    | "\\" ["\\/bfnrt] {%
    function(d, pos, reject) {
      try {
        return JSON.parse('"' + d.join('') + '"');
      } catch(e) {
        return reject;
      }
    }
%}

luku ->
  %numero:+ {% d => ({ tyyppi: 'numero', arvo: parseInt(d[0], 10) }) %}
  | %numero:+ "." %numero:+ {% d => ({ tyyppi: 'numero', arvo: parseFloat(flatJoin(d)) }) %}

@{% const kasitteleTotuusarvo = arvo => () => ({ tyyppi: 'totuusarvo', arvo }); %}
totuusarvo ->
  "Tosi" {% kasitteleTotuusarvo(true) %}
  | "Epätosi" {% kasitteleTotuusarvo(false) %}

br -> [\r\n]
