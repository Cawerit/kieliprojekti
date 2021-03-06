
#############################################################################
#
# Tämä tiedosto sisältää kieliopin määrittelyn Ö-kielelle.
# Yhdessä parseri.js-tiedoston kanssa, täällä siis hoidetaan kielen
# parsintavaihe. Huomaa kuitenkin että seuraavat parsintaan liittyvät
# tehtävät tehdään muualla:
#   - Sisennysten käsittely funktioluonneissa
#
# Määrittelyssä käytetään Earley-algoritmin toteuttamaa nearley.js kirjastoa.
# nearley.js projektin kotisivu: http://nearley.js.org/
#
#############################################################################


@builtin "whitespace.ne"
@{%
  const _ = require('lodash');

  const varattu = /[",.=(){} ]|\s|\t|\n|\r|^infiksi$|^Tosi$|^Epätosi$|^kun$|^muutoin$|^on$/;
  const numero = /[0-9]/;

  const erikoismerkki = {
	  test(x) {
		  return !varattu.test(x) &&
		    !numero.test(x) &&
		    x !== '$'       &&
		    x !== '_'       &&
		    x.toLowerCase() === x.toUpperCase();
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

  const flatJoin = x => _.flattenDeep(x).join('');

  const kasitteleParametrit = p =>  (p || []).map(_.property('arvo'));

  // Apumuuttuja joka ottaa listan ensimmäisen alkion
  const
    fst = _.head,
    third = d => d[2];

%}


main ->
  "{" _ ylatasonIlmaisujoukko _ "}" {% d => ({ tyyppi: 'ohjelma', runko: d[2] }) %}

runko ->
  "{" _ ilmaisujoukko _ "}" {% third %}

@{% const kasitteleilmaisujoukko = d => [d[0]].concat(d[2]); %}
ilmaisujoukko ->
  ilmaisu
  | asetus __ ilmaisujoukko {% kasitteleilmaisujoukko %}
  | infiksifunktioluonti __ ilmaisujoukko {% kasitteleilmaisujoukko %}

ylatasonIlmaisujoukko ->
  ilmaisu
  | asetus
  | asetus __ ylatasonIlmaisujoukko {% kasitteleilmaisujoukko %}
  | infiksifunktioluonti __ ylatasonIlmaisujoukko {% kasitteleilmaisujoukko %}

argumenttilista ->
  ilmaisu
  | ilmaisu _ "," _ argumenttilista {% d => [d[0]].concat(d[4]) %}

parametrilista ->
  muuttuja
  | muuttuja _ "," _ parametrilista {% d => [d[0]].concat(d[4]) %}

ilmaisu ->
  yksinkertainenIlmaisu   {% fst %}
  | infiksifunktiokutsu   {% fst %}

yksinkertainenIlmaisu ->
  laskettuArvo    {% fst %}
  | luku          {% fst %}
  | teksti        {% fst %}
  | totuusarvo    {% fst %}

laskettuArvo ->
  funktiokutsu                    {% fst %}
  | lambda                        {% fst %}
  | sovituslausejoukko            {% fst %}
  | muuttuja                      {% fst %}
  | "(" _ infiksifunktio _ ")"    {% third %}
  | "(" _ ilmaisu _ ")"          {% d => ({ tyyppi: 'ilmaisu', runko: [d[2]] }) %}


sovituslausejoukko ->
  "kun" __ ilmaisu __ sovituslause:+ "tai" __ ilmaisu __ "muutoin"
  {% d => {
    return { tyyppi: 'sovituslausejoukko', arvo: d[2], runko: d[4], oletusArvo: d[7] };
  }%}

sovituslause ->
  "on" __ ilmaisu __ "niin" __ ilmaisu __
  {% d => {
    return { tyyppi: 'sovituslause', ehto: d[2], arvo: d[6] };
  }%}

asetus ->
  funktioluonti           {% fst %}
  | muuttujaluonti        {% fst %}

infiksifunktioluonti ->
  "infiksi" __ luku __ erikoismerkkijono _ "(" _ parametrilista:? _ ")" _ "=" _ runko
  {% d => {
      const [, , presedenssi, , nimi, , , , parametrit, , , , , , runko] = d;
      return {
        tyyppi: 'infiksifunktioluonti',
        presedenssi: presedenssi.arvo,
        arvo: nimi,
        parametrit: kasitteleParametrit(parametrit).reverse(),
        runko
      };
  }%}

# Asettaa funktion muuttujaan
funktioluonti ->
  muuttuja _ "(" _ parametrilista:? _ ")" _ "=" _ runko
    {% d => {
      return {
        tyyppi: 'funktioluonti',
        arvo: d[0].arvo,
        parametrit: kasitteleParametrit(d[4]),
        runko: d[10]
      };
    }%}

lambda ->
  "{" _ ilmaisu _ "}"
  {% d => {
    return {
      tyyppi: 'lambda',
      arvo: null,
      parametrit: ['$'],
      runko: [d[2]]
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

infiksifunktiokutsu -> ilmaisu __ infiksifunktio __ yksinkertainenIlmaisu
  {% d => {
      return {
        tyyppi: 'funktiokutsu',
        infiksi: true,
        arvo: d[2],
        argumentit: [d[4], d[0]]
      };
  }%}

funktiokutsu -> laskettuArvo _ "(" _ argumenttilista:? _ ")"
  {% d => {
    return { tyyppi: 'funktiokutsu', arvo: d[0], argumentit: d[4] || [] };
  }%}

infiksifunktio -> erikoismerkkijono {% d => ({ tyyppi: 'infiksifunktio', arvo: d[0] }) %}

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
  "-":? %numero:+ {% d => ({ tyyppi: 'numero', arvo: parseInt(flatJoin(d), 10) }) %}
  | "-":? %numero:+ "." %numero:+ {% d => ({ tyyppi: 'numero', arvo: parseFloat(flatJoin(d)) }) %}

@{% const kasitteleTotuusarvo = arvo => () => ({ tyyppi: 'totuusarvo', arvo }); %}
totuusarvo ->
  "Tosi" {% kasitteleTotuusarvo(true) %}
  | "Epätosi" {% kasitteleTotuusarvo(false) %}

br -> [\r\n]
