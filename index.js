var args      = require('yargs').argv,
    fs        = require('fs'),
    generoi   = require('./generointi.js'),
    apufunktiot = require('./apufunktiot.js'),
    virheviestit  = require('./virheviestit.js')
    ;


if (args.f) {
    fs.readFile(args.f, 'utf8', function(virhe, tiedosto) {
        if (virhe) {
            console.error(virhe);
            return;
        }
    
        try {
            const generoitu = generoi(tiedosto);
            
            console.log(generoitu);
        } catch (err) {
            console.error(virheviestit.kasitteleVirhe(err, tiedosto));
        }
    });
}