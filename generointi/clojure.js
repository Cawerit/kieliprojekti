const
    apufunktiot     = require('../apufunktiot.js'),
    generoiRunko    = require('./generoi-runko.js'),
    _               = require('lodash');

const clojureKommentti = _.constant('');

module.exports = asetukset => {
    const
        generaattoriAsetukset = {
          ohita: asetukset.salliStandardikirjasto ? ['standardikirjasto'] : [],
          kommentoi: clojureKommentti
        },
        muuttuja = apufunktiot
            .muuttujanimiGeneraattori(generaattoriAsetukset);
  
    const muodostaRunko = (solmu, uusiScope) => {
        const runko = generoiRunko(solmu, uusiScope());
        
        return runko
            .map((r, i) => '  '.repeat(i) + r)
            .join('\n');
    };
  
    const funktioluonti = ({ solmu, uusiScope }) => {
        const
          parametrit  = solmu.parametrit.map(muuttuja),
          nimi        = solmu.arvo ? muuttuja(solmu.arvo) : 'fn';
        
        const runko = muodostaRunko(solmu, uusiScope);
        
        // Jos argumentit ovat [a, b, c],
        // Niin luodaan funktio
        // function (a) { return function(b) { return function(c) { runko } } }
        
        if (parametrit.length === 0) {
          parametrit.push('');
        }
        
        const curryParametrit = _.map(_.initial(parametrit), (p, i, parametrit) => {
            const osittaiset = parametrit.slice(0, i + 1).join(' ');
            
            return `([${osittaiset}] (partial ${nimi} ${osittaiset}))\n  `;
        })
        .join('');
        
        return `(defn ${nimi}\n  ${curryParametrit} ([${parametrit.join(' ')}] ${runko}))`;
    };
    
    // Muutama apufunktio
    const
        $arvo = a => a.solmu.arvo,
        $muuttuja = a => muuttuja($arvo(a)),
        kasitteleRungonRivi = r => r;
  
    return {
        ohjelma({ solmu, kavele }) {
            const
                namespace = asetukset.namespace || 'ohjelma',
                use = asetukset.salliStandardikirjasto ?
                    '(:use standardikirjastoNatiivi)'
                    : '(:use standardikirjasto)';
            
            return `(ns ${namespace} ${use})` + '\n' +
                solmu
                .runko
                .map(kavele)
                .map(kasitteleRungonRivi)
                .join('\n') +
                '\n\n' +
                (asetukset.vaadiOhjelma === false ? '' : `(${muuttuja('ohjelma')} ${muuttuja('tila')})`);
        },
        
        funktioluonti,
        
        infiksifunktioluonti: funktioluonti,
        
        funktiokutsu({ solmu, kavele }) {
            const arvo = kavele(solmu.arvo);
            let argumentit = solmu.argumentit.map(kavele);
            
            return `(${arvo} ${argumentit.join(' ')})`;
        },
        
        muuttujaluonti({ solmu, kavele, uusiScope }) {
            // Apufunktio joka turvaa muuttujanimen jos solmua ei ole
            // määritetty generoinnin "sisäiseksi" muuttujaksi
            const luoMuuttuja = solmu._sisainenMuuttuja ? _.identity : muuttuja;
        
            const runko = muodostaRunko(solmu, uusiScope);
        
            return `(def ${luoMuuttuja(solmu.arvo)} ${runko})`;
        },
        
        numero: $arvo,
        
        muuttuja: $muuttuja,
        
        infiksifunktio: $muuttuja,
        
        totuusarvo: $arvo,
        
        teksti({ solmu }) {
            return JSON.stringify(solmu.arvo);
        },
        
        sovituslausejoukko({ solmu, kavele, scope }) {
            const arvo = scope.sisainenMuuttuja('$ehtolause_arvo', [solmu.arvo]);
            scope.viittaus({ arvo });
            
            const vertailut = solmu.runko.map(s => {
                let
                  ehto  = kavele(s.ehto),
                  tulos = kavele(s.arvo);
                
                return `(if (standardikirjastoNatiivi/vrt ${ehto} ${arvo}) ${tulos} `;
            }).join(' ');
            
            return vertailut + ` ${ kavele(solmu.oletusArvo) })`;
        }
        
    };
};