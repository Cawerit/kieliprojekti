
const numeroReg = /[0-9]|\./;

const onErikoismerkki = kirjain => !numeroReg.test(kirjain) && kirjain.toUpperCase() === kirjain.toLowerCase(); 

function sisaltaaErikoismerkkeja(teksti) {
    return Array.from(teksti).some(onErikoismerkki);
}

module.exports = { sisaltaaErikoismerkkeja, onErikoismerkki, numeroReg };
