var fs = require('fs'),
    path = require('path'),
    tokenisointi = require('./tokenisointi.js'),
    parseri = require('./parseri.js'),
    muunnos = require('./muunnos.js'),
    _ = require('lodash');
    
    
const
    muunna = _.flow([tokenisointi.tokenisoi, parseri.parse, muunnos.muunna]),
    testiNimi = process.argv[2];
    
if (!testiNimi) {
    console.error(`
Testi tarvitsee nimen! Kutsu näin: "node luo-testi.js testin_nimi"
`
    );
    return;
}


const
    testiTiedosto = fs.readFileSync(path.join(__dirname, 'testi.ö'), 'utf8'),
    muunnettu = muunna(testiTiedosto);

fs.writeFileSync(path.join(__dirname, 'testitiedostot', testiNimi + '.ö'), testiTiedosto, 'utf8');
fs.writeFileSync(path.join(__dirname, 'testitiedostot', testiNimi + '.json'), JSON.stringify(muunnettu, null, 2), 'utf8');

