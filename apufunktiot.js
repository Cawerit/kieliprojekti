var _ = require('lodash');

const numeroReg = /[0-9]|\./;

const onErikoismerkki = kirjain => !numeroReg.test(kirjain) && kirjain.toUpperCase() === kirjain.toLowerCase(); 

function nayta (obj) {
    obj = _.cloneDeep(obj);
    
    function naytaRekursiivinen(obj) {
        return _.forEach(obj, (val, key) => {
          const t = typeof val;
          if (t === 'object') {
              naytaRekursiivinen(val);
          } else if (t === 'symbol') {
              obj[key] = val.toString().match(/Symbol\((.*)\)/)[1];
          }
        });
    }
    
    const tulos = JSON.stringify(naytaRekursiivinen(obj), null, 2);
    console.log(tulos);
    return tulos;
}


function sisaltaaErikoismerkkeja(teksti) {
    return Array.from(teksti).some(onErikoismerkki);
}

module.exports = { sisaltaaErikoismerkkeja, onErikoismerkki, numeroReg, nayta };
