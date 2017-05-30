var args      = require('yargs').argv,
    fs        = require('fs'),
    path      = require('path'),
    generoi   = require('./generointi.js'),
    virheviestit  = require('./virheviestit.js'),
    kohdekielet   = require('./kohdekielet.js');

function gen(tiedosto, kieli) {
    const
        paate = kohdekielet.tiedostoPaate(kieli),
        standardikirjastoNatiivi = fs.readFileSync(path.join(__dirname, 'kirjastot', 'standardikirjasto' + '.' + paate), 'utf8'),
        standardikirjasto = 
            'a = 1';    // DEBUG
            // fs.readFileSync(path.join(__dirname, 'kirjastot', 'standardikirjasto.ö'), 'utf8');

    const tulos = generoi(tiedosto, kieli, { standardikirjasto });
    tulos.standardikirjastoNatiivi = standardikirjastoNatiivi;

    return tulos;
}


if (args.f) {
    fs.readFile(args.f, 'utf8', function(virhe, tiedosto) {
        if (virhe) {
            console.error(virhe);
            return;
        }
        
        const kieli = (args.kieli || args.k || 'javascript').toLowerCase();
    
        try {
            const { standardikirjastoNatiivi, generoituStandardikirjasto, generoituKoodi }
                = gen(tiedosto, kieli);

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