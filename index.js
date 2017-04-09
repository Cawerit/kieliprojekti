var args = require('yargs').argv,
    path = require('path'),
    fs = require('fs'),
    tokenisointi = require('./tokenisointi.js'),
    parseri = require('./parseri.js'),
    muuntaja = require('./muunnos.js'),
    virheet = require('./virheviestit.js'),
    forEach = require('lodash/forEach')
    ;


if (args.f) {
    fs.readFile(args.f, 'utf8', function(virhe, tiedosto) {
        if (virhe) {
            console.error(virhe);
            return;
        }
        
        const tokenit = tokenisointi.tokenisoi(tiedosto);
        let ast;
        try {
            ast = parseri.parse(tokenit);
        } catch(virhe) {
            console.log(virheet.kasitteleVirhe(virhe, tiedosto));
            return;
        }
        const muunnettu = muuntaja.muunna(ast);
        try {
            console.log(JSON.stringify(nayta(muunnettu), null, 2));
        } catch (err) {
            console.log('fail');
        }
    });
}

function nayta(obj) {
    return forEach(obj, (val, key) => {
      const t = typeof val;
      if (t === 'object') {
          nayta(val);
      } else if (t === 'symbol') {
          obj[key] = val.toString().match(/Symbol\((.*)\)/)[1];
      }
    });
}