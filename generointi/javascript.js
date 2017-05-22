const beautify = require('js-beautify').js_beautify,
  apufunktiot = require('../apufunktiot.js'),
  _ = require('lodash');

module.exports = asetukset => {
  const muuttuja = apufunktiot
    .muuttujanimiGeneraattori(asetukset.salliStandardikirjasto ? ['standardikirjasto'] : []);

  // Pieni apufunktio funktion rungon muodostamiseen
  const muodostaRunko = (solmu, kavele) => {
    const runko = solmu.runko.map(kavele).map(s => s + ';\n');

    if (runko.length > 0) {
      runko[runko.length - 1] = 'return ' + runko[runko.length - 1];
    }

    return runko;
  };

  const funktioluonti = ({ solmu, uusiScope }) => {
    const
      kavele      = uusiScope(),
      parametrit  = solmu.parametrit.map(muuttuja),
      runko       = muodostaRunko(solmu, kavele),
      nimi        = solmu.arvo ? muuttuja(solmu.arvo) : '';

    // Jos argumentit ovat [a, b, c],
    // Niin luodaan funktio
    // function (a) { return function(b) { return function(c) { runko } } }

    if (parametrit.length === 0) {
      parametrit.push('');
    }

    return _.reduceRight(parametrit, (edellinen, seuraava) => {
      const sisalto = edellinen === null
        ? runko.join(' ')
        : `return ${edellinen}`;

      return `function ${nimi} (${seuraava}) { ${sisalto} }`;
    }, null);
  };

  return {

    ohjelma(kavely) {
      const solmu = kavely.solmu,
        tulos = solmu.runko.map(kavely.kavele).map(x => x + ';').join('\n'),
        ohjelmaNimi = muuttuja('ohjelma'),
        tilaNimi = muuttuja('tila');

      return beautify(asetukset.vaadiOhjelma === false
        ? tulos
        : `
(function() {
${tulos}
;

if (typeof ${ohjelmaNimi} !== 'function' || typeof ${tilaNimi} === 'undefined') {
  throw new Error('Ö-ohjelma vaatii funktion nimeltä "ohjelma" ja tilan');
} else {
  standardikirjasto(0, "suorita", ${ohjelmaNimi}, ${tilaNimi});
}
})();

    `);
    },

    funktioluonti,

    infiksifunktioluonti: funktioluonti,

    lambda: funktioluonti,

    muuttujaluonti({solmu, kavele}) {
      if (solmu.runko.length === 1 && solmu.runko[0].tyyppi !== funktioluonti) {
        return `var ${muuttuja(solmu.arvo)} = ${kavele(solmu.runko[0])}`;
      } else {
        const runko = muodostaRunko(solmu, kavele);

        return `var ${muuttuja(solmu.arvo)} = (function (){ ${runko} })()`;
      }
    },

    muuttuja({solmu}) {
      return muuttuja(solmu.arvo);
    },

    infiksifunktio({solmu}) {
      return muuttuja(solmu.arvo);
    },

    numero({solmu}) {
      return solmu.arvo;
    },

    sovituslausejoukko({solmu, kavele, scope}) {
      const arvo = scope.muuttuja('$ehtolause_arvo', [solmu.arvo]);
      const vertailut = solmu.runko.map(s => {
        const ehto = scope.muuttuja('$ehtolause_ehto', [s.ehto]);
        const tulos = kavele(s.arvo);
        return `(typeof ${ehto} == 'function' ? ${ehto}(${arvo}) : ${ehto}) ? (${tulos})`;
      }).join(' : ');

      return vertailut;
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
    }
  };
};
