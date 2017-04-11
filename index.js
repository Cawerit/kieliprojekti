var args = require('yargs').argv,
    path = require('path'),
    fs = require('fs'),
    tokenisointi = require('./tokenisointi.js'),
    parseri = require('./parseri.js'),
    muuntaja = require('./muunnos.js'),
    virheet = require('./virheviestit.js'),
    forEach = require('lodash/forEach'),
    generointi = require('./generointi.js'),
    cloneDeep = require('lodash/cloneDeep'),
    apufunktiot = require('./apufunktiot.js')
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
    
        apufunktiot.nayta(muunnettu);
        return;
        
        
        console.log('=======================================');
        
        return;
    
        const generoitu = generointi.generoi(muunnettu, args.kieli || 'java');
    
        console.log(generoitu);
    });
}