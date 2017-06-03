const
    apufunktiot     = require('../apufunktiot.js'),
    generoiRunko    = require('./generoi-runko.js'),
    _               = require('lodash');

const clojureKommentti = _.constant('');
const indent = '  ';

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
        let tulos;
        
        if (runko.length > 1) {
            tulos = 
                '(let [\n  ' +
                    _.initial(runko)
                    .join('\n' + indent.repeat(2)) +
                '] ' +
                _.last(runko) + ')';
        } else {
            tulos = runko[0];
        }
                    
        return tulos;
    };
  
    const funktioluonti = ({ solmu, scope, uusiScope }) => {
        const
          parametrit  = solmu.parametrit.map(muuttuja),
          nimi        = solmu.arvo ? muuttuja(solmu.arvo) : '';
        
        const runko = muodostaRunko(solmu, uusiScope);
        
        if (parametrit.length === 0) {
          parametrit.push('');
        }
        
        const curryParametrit = _.map(_.initial(parametrit), (p, i, parametrit) => {
            const osittaiset = parametrit.slice(0, i + 1).join(' ');
            
            return `([${osittaiset}] (partial ${nimi} ${osittaiset}))\n  `;
        })
        .join('');
        
        if (scope.parent || !nimi) {
            return `${nimi} (fn ${nimi} ${curryParametrit} ([${parametrit.join(' ')}] ${runko}))`;
        } else {
            return `(defn ${nimi}\n  ${curryParametrit} ([${parametrit.join(' ')}] ${runko}))`;   
        }
    };
    
    // Muutama apufunktio
    const
        $arvo = a => a.solmu.arvo,
        kasitteleRungonRivi = r => r;
  
    return {
        ohjelma({ solmu, kavele }) {
            const
                namespace = asetukset.namespace || 'ohjelma',
                use = asetukset.salliStandardikirjasto ?
                    '(:use standardikirjastoNatiivi)'
                    : '(:use standardikirjasto)';
            
            return `(ns ${namespace} ${use})` + '\n' +
                generoiRunko(solmu, kavele)
                .map(kasitteleRungonRivi)
                .join('\n') +
                '\n\n' +
                (asetukset.vaadiOhjelma === false ? ''
                : `(standardikirjastoNatiivi/suorita ${muuttuja('ohjelma')} ${muuttuja('tila')})`);
        },
        
        funktioluonti,
        
        infiksifunktioluonti: funktioluonti,
        
        funktiokutsu({ solmu, kavele }) {
            const arvo = kavele(solmu.arvo);
            let argumentit = solmu.argumentit.map(kavele);
            
            return `(${arvo} ${argumentit.join(' ')})`;
        },
        
        muuttujaluonti({ solmu, kavele, scope, uusiScope }) {
            const
                runko = muodostaRunko(solmu, uusiScope),
                nimi = solmu._sisainenMuuttuja ? solmu.arvo : muuttuja(solmu.arvo);
        
            return scope.parent
                ? nimi + ' ' + runko
                : `(def ${nimi} ${runko})`;
        },
        
        numero: $arvo,
        
        muuttuja({ solmu, scope }){
            scope.viittaus(solmu);
            return muuttuja(solmu.arvo);
        },
        
        infiksifunktio({ solmu }) {
            return muuttuja(solmu.arvo);
        },
        
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