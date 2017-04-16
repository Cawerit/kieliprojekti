var _ = require('lodash');

const numeroReg = /[0-9]|\./;

const onErikoismerkki = kirjain => !numeroReg.test(kirjain) && kirjain.toUpperCase() === kirjain.toLowerCase(); 

function nayta (obj) {
    console.log(JSON.stringify(obj, null, 4));
}


function sisaltaaErikoismerkkeja(teksti) {
    return Array.from(teksti).some(onErikoismerkki);
}

module.exports = { sisaltaaErikoismerkkeja, onErikoismerkki, numeroReg, nayta };
