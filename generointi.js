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
        parsittuKoodi = muunnos(parseri(koodi), parsittuStandardikirjasto),
        
        generoituStandardikirjasto = generoi(parsittuStandardikirjasto, kohdekieli, { salliStandardikirjasto: true, vaadiOhjelma: false }),
        generoituKoodi = generoi(parsittuKoodi, kohdekieli, { salliStandardikirjasto: false, vaadiOhjelma: true });
        
    return standardikirjastoJs + '\n\n' +
        generoituStandardikirjasto + '\n\n' +
        generoituKoodi;
};

function generoi(ast, kohdekieli, asetukset) {
    const generoija = require('./generointi/' + kohdekieli + '.js')(asetukset);
    
    const kavele = solmu => {
      const koodari = generoija[solmu.tyyppi];
      if (koodari) {
          return koodari({
              solmu,
              kavele
          });
      } else {
          const err = new Error(`Ei muokkaajaa tyypille ${solmu.tyyppi}`);
          console.log(err);
          throw err;
       }
    };
    
    return kavele(ast);
}