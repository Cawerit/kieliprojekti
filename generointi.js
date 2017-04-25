var parseriTyypit = require('./parserityypit.js');
var virheet = require('./virheviestit.js');

module.exports.generoi = function(ast, kohdekieli) {
    const generoija = require('./generointi/' + kohdekieli + '.js');
    
    if (!ast.length === 1 || ast[0].tyyppi !== parseriTyypit.OHJELMA) {
        throw new Error(virheet.GENEROINTI_TARVITSEE_OHJELMAN);
    }
    
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
    
    return kavele(ast[0]);
};