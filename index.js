var args = require('yargs').argv,
    path = require('path'),
    fs = require('fs'),
    tokenisointi = require('./tokenisointi.js'),
    parseri = require('./parseri.js'),
    muuntaja = require('./muunnos.js');


if (args.f) {
    fs.readFile(args.f, 'utf8', function(virhe, tiedosto) {
        if (virhe) {
            console.error(virhe);
            return;
        }
        
        const tokenit = tokenisointi.tokenisoi(tiedosto);
        const ast = parseri.parse(tokenit);
        const muunnettu = muuntaja.muunna(ast);
        
        console.log(JSON.stringify(muunnettu, null, 2));
    });
}