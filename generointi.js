var virheet = require('./virheviestit.js');
var fs = require('fs');
var path = require('path');
var parseri = require('./parseri.js');
var muunnos = require('./muunnos.js');
var _ = require('lodash');

module.exports = function(koodi, kohdekieli = 'javascript') {
    const
        standardikirjastoJs = fs.readFileSync(path.join(__dirname, 'kirjastot', 'standardikirjasto.js'), 'utf8'),
        standardikirjasto = fs.readFileSync(path.join(__dirname, 'kirjastot', 'standardikirjasto.ö'), 'utf8'),
        parsittuStandardikirjasto = muunnos(parseri(standardikirjasto)),
        parsittuKoodi = muunnos(parseri(koodi), parsittuStandardikirjasto);
        
    return generoi(parsittuKoodi, kohdekieli);
};

function generoi(ast, kohdekieli, vaadiOhjelma = false) {
    const generoija = require('./generointi/' + kohdekieli + '.js');
    
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
    
    return kavele(ast);
}