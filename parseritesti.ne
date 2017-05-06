@builtin "whitespace.ne"

@{%
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

%}


main -> runko {% _.head %}

runko -> ilmaisujoukko {% d => d[0] %}

ilmaisujoukko ->
  ilmaisu
  | ilmaisu _ "\n" _ ilmaisujoukko {% d => [d[0]].concat(d[4]) %}

argumenttilista ->
  ilmaisu
  | ilmaisu _ "," _ argumenttilista {% d => [d[0]].concat(d[4]) %}

parametrilista ->
  muuttuja
  | muuttuja _ "," _ parametrilista {% d => [d[0]].concat(d[4]) %}

ilmaisu ->
  funktioluonti {% _.head %}
  | funktiokutsu {% _.head %}
  | muuttuja {% _.head %}
  | luku {% _.head %}


funktioluonti -> muuttuja _ "(" _ parametrilista:? _ ")" _ "="
  {% kasittele.funktioluonti %}

funktiokutsu -> muuttuja _ "(" _ argumenttilista:? _ ")"
  {% kasittele.funktiokutsu %}

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
