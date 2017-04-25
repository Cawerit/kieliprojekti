var P = require('../parserityypit.js');
var beautify = require('js-beautify').js_beautify;
var base32 = require('base32');

const enk = n => 'm_' + base32.encode(n) + `/*${n.replace(/\*\//g, '* /')}*/`;

module.exports = {
  
  [P.OHJELMA]: kavely => {
    const solmu = kavely.solmu;
    const tulos = solmu.runko.map(kavely.kavele).join('; ');
    return beautify(tulos);
  },
  
  [P.FUNKTIOLUONTI]: kavely => {
    const solmu = kavely.solmu;
    const parametrit = solmu.parametrit.ilmaisut.map(i => enk(i[0].arvo)).join(', ');
    
    return (
`
function ${enk(solmu.arvo)} (${parametrit}) { ${solmu.runko.map(n => kavely.kavele(n) + ';').join('')} }`);

  },
  
  [P.FUNKTIOKUTSU]: ({ solmu, kavele }) => {
    const argumentit = solmu.argumentit.ilmaisut.map(i => kavele(i[0])).join(',');
    
    return `${enk(solmu.arvo)}(${argumentit})`
  },
  
  [P.MUUTTUJA]: ({solmu, kavele}) => enk(solmu.arvo)
    
};