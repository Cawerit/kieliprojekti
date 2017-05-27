var generoi   = require('./generointi.js');

module.exports = function gen(tiedosto, kieli, { standardikirjasto, standardikirjastoJs }) {
    const tulos = generoi(tiedosto, kieli, { standardikirjasto });
    tulos.standardikirjastoNatiivi = standardikirjastoJs;

    return tulos;
};