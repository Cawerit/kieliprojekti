var parseriTyypit = require('./parserityypit.js');
var virheet = require('./virheviestit.js');

module.exports.generoi = function(ast, kohdekieli) {
    const generoija = require('./generointi/' + kohdekieli + '.js');
    
    if (!ast.length === 1 || ast[0].tyyppi !== parseriTyypit.OHJELMA) {
        throw new Error(virheet.GENEROINTI_TARVITSEE_OHJELMAN);
    }
    
    let tulos = '';
    
    ast[0].runko.forEach(solmu => {
       const koodari = generoija[solmu.tyyppi];
       if (koodari) {
           tulos += koodari({
               solmu
           });
       } else {
           console.log('looloolool');
           throw new Error(`Ei muokkaajaa tyypille ${solmu.tyyppi}`);
       }
    });
    
    return tulos;
};