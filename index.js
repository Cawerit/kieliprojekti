var args = require('yargs').argv,
    path = require('path'),
    fs = require('fs'),
    tokenisointi = require('./tokenisointi.js'),
    parseri = require('./parseri.js'),
    muuntaja = require('./muunnos.js'),
    virheet = require('./virheviestit.js')
    ;


if (args.f) {
    fs.readFile(args.f, 'utf8', function(virhe, tiedosto) {
        if (virhe) {
            console.error(virhe);
            return;
        }
        
        const tokenit = tokenisointi.tokenisoi(tiedosto);
        let ast;
        try {
            ast = parseri.parse(tokenit);   
        } catch(virhe) {
            console.log(virheet.kasitteleVirhe(virhe, tiedosto));
            return;
        }
        const muunnettu = muuntaja.muunna(ast);
        
        console.log(JSON.stringify(muunnettu, null, 2));
    });
}