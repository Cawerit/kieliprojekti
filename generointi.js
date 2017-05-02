var parseriTyypit = require('./parserityypit.js');
var virheet = require('./virheviestit.js');
var fs = require('fs');
var path = require('path');
var tokenisointi = require('./tokenisointi.js');
var parseri = require('./parseri.js');
var muunnos = require('./muunnos.js');
var _ = require('lodash');

const kasittele = _.flow([tokenisointi.tokenisoi, n => parseri.parse(n, true), muunnos.muunna]);

module.exports.generoi = function(ast, kohdekieli) {
    const standardikirjastoJs = fs.readFileSync(path.join(__dirname, 'kirjastot', 'standardikirjasto.js'), 'utf8');
    const standardikirjasto = fs.readFileSync(path.join(__dirname, 'kirjastot', 'standardikirjasto.ö'), 'utf8');
    
    return standardikirjastoJs + '\n' +
        generoi(kasittele(standardikirjasto), kohdekieli, true) + '\n' +
        generoi(ast, kohdekieli);
};

function generoi(ast, kohdekieli, vaadiOhjelma = false) {
    const generoija = require('./generointi/' + kohdekieli + '.js');
    
    if (!ast.length === 1 || ast[0].tyyppi !== parseriTyypit.OHJELMA) {
        throw new Error(virheet.GENEROINTI_TARVITSEE_OHJELMAN);
    }
    
    const kavele = solmu => {
      const koodari = generoija[solmu.tyyppi];
      if (koodari) {
          return koodari({
              solmu,
              kavele,
              vaadiOhjelma
          });
      } else {
          const err = new Error(`Ei muokkaajaa tyypille ${solmu.tyyppi}`);
          console.log(err);
          throw err;
       }
    };
    
    return kavele(ast[0]);
}