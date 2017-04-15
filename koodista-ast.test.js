// Tässä tiedostossa testataan koko koodi-tokenisointi-parsinta-muunnos sarjaa,
// jotta nähdään helposti jos jokin osa on hajonnut

var path = require('path'),
    fs = require('fs'),
    tokenisointi = require('./tokenisointi.js'),
    parseri = require('./parseri.js'),
    muunnos = require('./muunnos.js'),
    globby = require('globby'),
    _ = require('lodash');
    
// Funktio joka suorittaa kaikki kolme AST luonnin vaihetta
const koodistaAst = _.flow(tokenisointi.tokenisoi, parseri.parse, muunnos.muunna);


// Käydään läpi kaikki valmiiksi luodut testit testitiedostot-kansiosta

const testit = [];

globby.sync(['testitiedostot/*.ö']).forEach(koodiTiedostonimi => {
    const 
        testiNimi = path.basename(koodiTiedostonimi, '.ö'),
        tulosTiedostonimi = path.join('testitiedostot', testiNimi + '.json'),
        koodiTiedosto = fs.readFileSync(koodiTiedostonimi, 'utf8'),
        tulos = JSON.parse(fs.readFileSync(tulosTiedostonimi));
    
    testit.push({ koodiTiedosto, tulos, testiNimi: testiNimi.replace(/_|-/g, ' ') });
});

describe('koodista ast:ksi muuttaminen', () => {
    testit.forEach(testi => {
        test(testi.testiNimi, () => {
           expect(koodistaAst(testi.koodiTiedosto)).toEqual(testi.tulos);
        });
    }); 
});



