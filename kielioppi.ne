@builtin "whitespace.ne"

@{%
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

%}


main -> runko br:* {% _.head %}

runko ->
  "%%%{" _ ilmaisujoukko _ "}%%%" {% d => d[2] %}

@{% const kasitteleilmaisujoukko = d => [d[0]].concat(d[4]); %}
ilmaisujoukko ->
  ilmaisu
  | asetus _ ";" _ ilmaisujoukko {% kasitteleilmaisujoukko %}
  | infiksifunktioluonti _ ";" _ ilmaisujoukko {% kasitteleilmaisujoukko %}

argumenttilista ->
  ilmaisu
  | ilmaisu _ "," _ argumenttilista {% d => [d[0]].concat(d[4]) %}

parametrilista ->
  muuttuja
  | muuttuja _ "," _ parametrilista {% d => [d[0]].concat(d[4]) %}

asetus ->
  funktioluonti {% _.head %}
  | muuttujaluonti {% _.head %}

ilmaisu ->
  ilmaisuEiInfiksi {% _.head %}
  | infiksifunktiokutsu {% _.head %}

ilmaisuEiInfiksi ->
  funktioluonti {% _.head %}
  | funktiokutsu {% _.head %}
  | muuttuja {% _.head %}
  | luku {% _.head %}

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
  muuttuja _ "=" _ ilmaisu:? runko:?
  {% function(d, pos, reject) {
    const [nimi, , , ,ilmaisu, runko] = d;
    if (!ilmaisu && !runko) return reject;
    return {
      tyyppi: 'muuttujaluonti',
      arvo: nimi.arvo,
      runko: ilmaisu || runko
    };
  }%}

infiksifunktiokutsu -> ilmaisu _ erikoismerkkijono _ ilmaisuEiInfiksi
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
    return _.every(res, r => /[0-9.]/.test(r)) ? reject : res;
  }
%}

luku ->
  %numero:+ {% d => ({ tyyppi: 'numero', arvo: parseInt(d[0], 10) }) %}
  | %numero:+ "." %numero:+ {% d => ({ tyyppi: 'numero', arvo: parseFloat(flatJoin(d)) }) %}

br -> [\r\n]
