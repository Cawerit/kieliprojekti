var P = require('../parserityypit.js');
var beautify = require('js-beautify').js_beautify;
var base32 = require('base32');

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
    const solmu = kavely.solmu;
    const tulos = solmu.runko.map(kavely.kavele).join('; ');
    return beautify(tulos);
  },
  
  [P.FUNKTIOLUONTI]: generoiFunktioluonti,
  
  [P.INFIKSIFUNKTIOLUONTI]: kavely => {
    return generoiFunktioluonti({ kavele: kavely.kavele, solmu: kavely.solmu.runko[0] });
  },
   
  [P.FUNKTIOKUTSU]: ({ solmu, kavele }) => {
    const argumentit = solmu.argumentit.ilmaisut.map(i => kavele(i[0])).join(',');
    
    return `${enk(solmu.arvo)}(${argumentit})`
  },
  
  [P.MUUTTUJA]: ({solmu}) => enk(solmu.arvo),
  
  [P.NATIIVIKUTSU]: ({solmu, kavele}) => {
    const argumentit = solmu.argumentit.ilmaisut.map(i => kavele(i[0])).join(',');
    return `standardikirjasto.${solmu.arvo.replace(/%%%/g, '')}(${argumentit})`;  
  },
  
  [P.NUMERO]: ({solmu}) => parseFloat(solmu.arvo),
  
  [P.TEKSTI]: ({solmu}) => '"' + (solmu.arvo) + '"'
    
};