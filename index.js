var args = require('yargs').argv,
    path = require('path'),
    fs = require('fs'),
    esitokenisointi = require('./esitokenisointi.js')
    ;


if (args.f) {
    fs.readFile(args.f, 'utf8', function(virhe, tiedosto) {
        if (virhe) {
            console.error(virhe);
            return;
        }

        const esikasittely = esitokenisointi(tiedosto);
        
        console.log(esikasittely);
    });
}
