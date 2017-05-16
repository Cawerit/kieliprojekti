const
    base32 = require('base32'),
    _ = require('lodash');

const numeroReg = /[0-9]|\./;

const onErikoismerkki = kirjain => !numeroReg.test(kirjain) && kirjain.toUpperCase() === kirjain.toLowerCase(); 

function nayta (obj) {
    console.log(JSON.stringify(obj, null, 4));
}

function onNatiivikutsu(nimi) {
    return /%%%[A-Za-z]+%%%/.test(nimi);
}

function sisaltaaErikoismerkkeja(teksti) {
    return Array.from(teksti).some(onErikoismerkki);
}

// ö-kieli tukee muuttujanimissä symboleita ja avainsanoja joita kohdekielet
// eivät tue. base32-enkoodaus on helppo tapa muuntaa muuttujanimet varmasti "turvallisiksi"
const muuttujanimiGeneraattori = (ohita = []) => nimi => {
    return _.includes(ohita, nimi) ? nimi : 'm_' + base32.encode(nimi) + `/*${nimi.replace(/\*\//g, '* /')}*/`;
};

module.exports = {
    sisaltaaErikoismerkkeja,
    onErikoismerkki,
    numeroReg,
    nayta,
    onNatiivikutsu,
    muuttujanimiGeneraattori
};
