const
    apufunktiot     = require('../apufunktiot.js'),
    generoiRunko    = require('./generoi-runko.js'),
    _               = require('lodash');

module.exports = asetukset => {
    const muuttuja = apufunktiot
        .muuttujanimiGeneraattori(asetukset.salliStandardikirjasto ? ['standardikirjasto'] : []);
  
    const muodostaRunko = (solmu, uusiScope) => {
        const runko = generoiRunko(solmu, uusiScope());
        
        return runko
          .join(' ');
    };
  
    const funktioluonti = ({ solmu, uusiScope }) => {
        const
          parametrit  = solmu.parametrit.map(muuttuja),
          nimi        = solmu.arvo ? muuttuja(solmu.arvo) : '';
        
        const runko = muodostaRunko(solmu, uusiScope);
        
        // Jos argumentit ovat [a, b, c],
        // Niin luodaan funktio
        // function (a) { return function(b) { return function(c) { runko } } }
        
        if (parametrit.length === 0) {
          parametrit.push('');
        }
        
        return `defn ${nimi} [${parametrit.join(' ')}] ${runko}`;
    };
  
    const kasitteleRungonRivi = r => '(' + r + ')';
  
    return {
        ohjelma({ solmu, kavele }) {
            
            return solmu
                .runko
                .map(kavele)
                .map(kasitteleRungonRivi);
        },
        
        funktioluonti,
        
        funktiokutsu({ solmu, kavele }) {
            const arvo = kavele(solmu.arvo);
            let argumentit = solmu.argumentit.map(kavele);
            
            return arvo + argumentit.join(' ');
        },
        
        muuttujaluonti({ solmu, kavele, uusiScope }) {
            // Apufunktio joka turvaa muuttujanimen jos solmua ei ole
            // määritetty generoinnin "sisäiseksi" muuttujaksi
            const luoMuuttuja = solmu._sisainenMuuttuja ? _.identity : muuttuja;
        
            const runko = muodostaRunko(solmu, uusiScope);
        
            return `def ${luoMuuttuja(solmu.arvo)} ${runko}`;
        },
        
        numero({ solmu }) {
            return solmu.arvo;
        }
    };
};