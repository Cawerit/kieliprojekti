var args      = require('yargs').argv,
    fs        = require('fs'),
    parseri   = require('./parseri.js'),
    muunnos   = require('./muunnos.js'),
    apufunktiot = require('./apufunktiot.js')
    ;


if (args.f) {
    fs.readFile(args.f, 'utf8', function(virhe, tiedosto) {
        if (virhe) {
            console.error(virhe);
            return;
        }

        const
          parsittu = parseri(tiedosto),
          muunnettu = muunnos(parsittu);

        apufunktiot.nayta(muunnettu);
    });
}
