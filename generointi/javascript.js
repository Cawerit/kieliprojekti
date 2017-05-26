const beautify = require('js-beautify').js_beautify,
  apufunktiot = require('../apufunktiot.js'),
  generoiRunko = require('./generoi-runko.js'),
  _ = require('lodash');

module.exports = asetukset => {
  const muuttuja = apufunktiot
    .muuttujanimiGeneraattori(asetukset.salliStandardikirjasto ? ['standardikirjasto'] : []);

  // Pieni apufunktio funktion rungon muodostamiseen
  const muodostaRunko = (solmu, uusiScope) => {
    const runko = generoiRunko(solmu, uusiScope());

    if (runko.length > 0) {
      runko[runko.length - 1] = 'return ' + runko[runko.length - 1];
    }

    return runko
      .join(' ');
  };

  const funktioluonti = ({ solmu, uusiScope }) => {
    const
      parametrit  = solmu.parametrit.map(muuttuja),
      nimi        = solmu.arvo ? muuttuja(solmu.arvo) : '';

    const runko = muodostaRunko(solmu, uusiScope);

    // Jos argumentit ovat [a, b, c],
    // Niin luodaan funktio
    // function (a) { return function(b) { return function(c) { runko } } }

    if (parametrit.length === 0) {
      parametrit.push('');
    }

    return _.reduceRight(parametrit, (edellinen, seuraava) => {
      const sisalto = edellinen === null
        ? runko
        : `return ${edellinen}`;

      return `function ${nimi} (${seuraava}) { ${sisalto} }`;
    }, null);
  };

  return {

    ohjelma(kavely) {
      const solmu = kavely.solmu,
        tulos = generoiRunko(solmu, kavely.kavele).join('\n'),
        ohjelmaNimi = muuttuja('ohjelma'),
        tilaNimi = muuttuja('tila');

      return beautify(asetukset.vaadiOhjelma === false
        ? tulos
        : `
(function() {
${tulos}

if (typeof ${ohjelmaNimi} !== 'function' || typeof ${tilaNimi} === 'undefined') {
  throw new Error('Ö-ohjelma vaatii funktion nimeltä "ohjelma" ja muuttujan nimeltä "tila"');
} else {
  standardikirjasto.suorita(${ohjelmaNimi}, ${tilaNimi});
}
})();

    `);
    },

    funktioluonti,

    infiksifunktioluonti: funktioluonti,

    lambda: funktioluonti,

    muuttujaluonti({solmu, kavele}) {
      // Apufunktio joka turvaa muuttujanimen jos solmua ei ole
      // määritetty generoinnin "sisäiseksi" muuttujaksi
      const luoMuuttuja = solmu._sisainenMuuttuja ? _.identity : muuttuja;

      if (solmu.runko.length === 1 && solmu.runko[0].tyyppi !== funktioluonti) {
        return `var ${luoMuuttuja(solmu.arvo)} = ${kavele(solmu.runko[0])}`;
      } else {
        const runko = muodostaRunko(solmu, kavele);

        return `var ${luoMuuttuja(solmu.arvo)} = (function (){ ${runko} })()`;
      }
    },

    muuttuja({ solmu, scope }) {
      scope.viittaus(solmu);
      return muuttuja(solmu.arvo);
    },

    infiksifunktio({solmu}) {
      return muuttuja(solmu.arvo);
    },

    numero({solmu}) {
      return solmu.arvo;
    },

    /**
    * Konditionaalien rakenne:
    * `kun x on y niin .. on z niin .. tai e muutoin`
    */
    sovituslausejoukko({solmu, kavele, scope}) {
      const arvo = scope.sisainenMuuttuja('$ehtolause_arvo', [solmu.arvo]);
      scope.viittaus({ arvo });

      const vertailut = solmu.runko.map(s => {
        const
          ehto  = kavele(s.ehto),
          tulos = kavele(s.arvo);

        return `standardikirjasto.vrt(${ehto}, ${arvo}) ? (${tulos})`;
      }).join(' : ');

      return vertailut + ` : ${ kavele(solmu.oletusArvo) }`;
    },

    funktiokutsu({solmu, kavele}) {
      const arvo = kavele(solmu.arvo);
      let argumentit = solmu.argumentit.map(kavele);

      if (arvo === 'standardikirjasto') {
        argumentit = '(' + argumentit.join(', ') + ')';
      } else {
        argumentit = argumentit.map(x => '(' + x + ')').join('');
      }

      return arvo + argumentit;
    },

    teksti({solmu}) {
      return JSON.stringify(solmu.arvo);
    },

    ilmaisu({solmu, kavele}) {
      return kavele(solmu.runko[0]);
    },

    totuusarvo({solmu}) {
      return solmu.arvo.toString();
    }

  };
};
