var args      = require('yargs').argv,
    fs        = require('fs'),
    generoi   = require('./generointi.js'),
    apufunktiot = require('./apufunktiot.js')
    ;


if (args.f) {
    fs.readFile(args.f, 'utf8', function(virhe, tiedosto) {
        if (virhe) {
            console.error(virhe);
            return;
        }

        const
            generoitu = generoi(tiedosto);

        apufunktiot.nayta(generoitu);
    });
}