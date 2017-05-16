var P = require('../parserityypit.js');
var beautify = require('js-beautify').js_beautify;
var base32 = require('base32');
var _ = require('lodash');

// ö-kieli tukee muuttujanimissä symboleita ja avainsanoja joita kohdekielet
// eivät tue. base32-enkoodaus on helppo tapa muuntaa muuttujanimet varmasti "turvallisiksi"
const enk = n => 'm_' + base32.encode(n) + `/*${n.replace(/\*\//g, '* /')}*/`;

const generoiFunktioluonti = kavely => {
  const solmu = kavely.solmu;
  const parametrit = solmu.parametrit.ilmaisut.map(i => enk(i[0].arvo)).join(', ');
  const runko = solmu.runko.map(n => kavely.kavele(n) + ';');
  if (runko.length) {
    runko[runko.length - 1] = 'return ' + runko[runko.length - 1];
  }

  return (
`
function ${enk(solmu.arvo)} (${parametrit}) { ${runko.join('')} }`);

};

module.exports = {

  [P.OHJELMA]: kavely => {
    const solmu = kavely.solmu,
      tulos = solmu.runko.map(kavely.kavele).join('; '),
      kaunistettu = beautify(tulos),
      ohjelmaNimi = enk('ohjelma'),
      tilaNimi = enk('tila')
    ;

    return kavely.vaadiOhjelma ? kaunistettu : `

${kaunistettu}
;

if (typeof ${ohjelmaNimi} !== 'function' || typeof ${tilaNimi} === 'undefined') {
  throw new Error('Ö-ohjelma vaatii funktion nimeltä "ohjelma" ja tilan');
} else {
  standardikirjasto.suorita(${ohjelmaNimi}, ${tilaNimi});
}

    `;
  },

  [P.FUNKTIOLUONTI]: generoiFunktioluonti,

  [P.INFIKSIFUNKTIOLUONTI]: kavely => {
    return generoiFunktioluonti({ kavele: kavely.kavele, solmu: kavely.solmu.runko[0] });
  },

  [P.FUNKTIOKUTSU]: ({ solmu, kavele }) => {
    solmu.arvo === 'jos' && console.log(solmu.argumentit.ilmaisut);
    const argumentit = _.map(_.head(solmu.argumentit.ilmaisut), i => kavele(i)).join(',');

    return `${enk(solmu.arvo)}(${argumentit})`
  },

  [P.MUUTTUJA]: ({solmu}) => enk(solmu.arvo),

  [P.NATIIVIKUTSU]: ({solmu, kavele}) => {
    const arvo = solmu.arvo.replace(/%%%/g, '');

    if (solmu.argumentit) {
      const argumentit = solmu.argumentit.ilmaisut.map(i => kavele(i[0])).join(',');
      return `standardikirjasto.${arvo}(${argumentit})`;
    } else {
      return `standardikirjasto.${arvo}`;
    }
  },

  [P.NUMERO]: ({solmu}) => parseFloat(solmu.arvo),

  [P.TEKSTI]: ({solmu}) => '"' + (solmu.arvo) + '"',

  [P.ASETUSLAUSE]: ({solmu, kavele}) => `var ${enk(solmu.arvo)} = (${solmu.runko.map(kavele)});`

};
