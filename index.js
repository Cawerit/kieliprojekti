var args      = require('yargs').argv,
    fs        = require('fs'),
    path      = require('path'),
    generoi   = require('./generointi.js'),
    virheviestit  = require('./virheviestit.js');

function gen(tiedosto, kieli) {
    const
        standardikirjastoJs = fs.readFileSync(path.join(__dirname, 'kirjastot', 'standardikirjasto.js'), 'utf8'),
        standardikirjasto = fs.readFileSync(path.join(__dirname, 'kirjastot', 'standardikirjasto.ö'), 'utf8');

    const tulos = generoi(tiedosto, kieli, { standardikirjasto });
    tulos.standardikirjastoNatiivi = standardikirjastoJs;

    return tulos;
}


if (args.f) {
    fs.readFile(args.f, 'utf8', function(virhe, tiedosto) {
        if (virhe) {
            console.error(virhe);
            return;
        }
    
        try {
            const { standardikirjastoNatiivi, generoituStandardikirjasto, generoituKoodi }
                = gen(tiedosto);

            const br = '\n\n';

            const tulos = standardikirjastoNatiivi + br + generoituStandardikirjasto + br + generoituKoodi;

            console.log(tulos);

        } catch (err) {
            console.error(virheviestit.kasitteleVirhe(err, tiedosto));
        }
    });
} else {
    module.exports = gen;
}