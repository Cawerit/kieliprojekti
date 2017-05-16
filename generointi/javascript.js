
const
  beautify    = require('js-beautify').js_beautify,
  base32      = require('base32'),
  apufunktiot = require('../apufunktiot.js'),
  _           = require('lodash');

const muuttuja = apufunktiot.muuttujanimiGeneraattori();

// Pieni apufunktio funktion rungon muodostamiseen
const muodostaRunko = (solmu, kavele) => {
  const runko = solmu
  .runko
  .map(kavele)
  .map(s => s + ';\n');
  
  if (runko.length > 0) {
    runko[runko.length - 1] = 'return ' + runko[runko.length - 1];
  }
  
  return runko;
};

module.exports = {

  ohjelma(kavely) {
    const
      solmu         = kavely.solmu,
      tulos         = solmu.runko.map(kavely.kavele).join('; '),
      kaunistettu   = beautify(tulos),
      ohjelmaNimi   = muuttuja('ohjelma'),
      tilaNimi      = muuttuja('tila');

    return kavely.vaadiOhjelma ? kaunistettu : `
(function() {
${kaunistettu}
;

if (typeof ${ohjelmaNimi} !== 'function' || typeof ${tilaNimi} === 'undefined') {
  throw new Error('Ö-ohjelma vaatii funktion nimeltä "ohjelma" ja tilan');
} else {
  standardikirjasto.suorita(${ohjelmaNimi}, ${tilaNimi});
}
})();

    `;
  },
  
  funktioluonti({ solmu, kavele }) {
    const
      parametrit = solmu.parametrit.map(muuttuja),
      
      runko = muodostaRunko(solmu, kavele),
        
      nimi = solmu.arvo ? muuttuja(solmu.arvo) : '';
    
    // Jos argumentit ovat [a, b, c],
    // Niin luodaan funktio
    // function (a) { return function(b) { return function(c) { runko } } }
    
    if (parametrit.length === 0) {
      parametrit.push('');
    }
    
    return _.reduceRight(parametrit, (edellinen, seuraava) => {
      return `function ${nimi} (${seuraava}) { ${edellinen} }`; 
    }, runko.join(''));
  },
  
  muuttujaluonti({ solmu, kavele }) {
    const runko = muodostaRunko(solmu, kavele);
    
    return `var ${muuttuja(solmu.arvo)} = (function (){ ${ runko } })();`
  },
  
  muuttuja({ solmu }) {
    return muuttuja(solmu.arvo);
  },
  
  numero({ solmu }) {
    return solmu.arvo;
  }
  
};
