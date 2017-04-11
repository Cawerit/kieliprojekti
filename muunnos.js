var tyypit = require('./parserityypit.js');
var apufunktiot = require('./apufunktiot.js');

function muunna(ast) {
    ulompi:
    do {
        for(let indeksi = 0, n = ast.length; indeksi < n; indeksi++) {
            const
                solu = ast[indeksi],
                edellinen = ast[indeksi-1],
                seuraava = ast[indeksi+1];
            
            if (solu.runko) {
                solu.runko = muunna(solu.runko);
            }
            
            if (solu.argumentit) {
                solu.argumentit.ilmaisut = muunna(solu.argumentit.ilmaisut);
            }
            
            if (solu.ilmaisut) {
                solu.ilmaisut = solu.ilmaisut.map(muunna);
            }
            
            /*console.log(
                edellinen && (`${edellinen.arvo}: ${edellinen.tyyppi.toString()}`), 
                solu && (`${solu.arvo}: ${solu.tyyppi.toString()}`),
                seuraava && (`${seuraava.arvo}: ${seuraava.tyyppi.toString()}`), 
                onInfiksi(edellinen, solu, seuraava));*/
            
            if (onInfiksi(edellinen, solu, seuraava)) {
                
                ast[indeksi] = {
                    tyyppi: tyypit.FUNKTIOKUTSU,
                    arvo: solu.arvo,
                    argumentit: {
                        ilmaisut: [edellinen, seuraava]
                    }
                };
                
                ast[indeksi-1] = undefined;
                ast[indeksi+1] = undefined;
                ast = ast.filter(a => a !== undefined);
                
                continue ulompi;
            }
        }
        
        break;
    } while(true);
    
    return ast;
}

const onIlmaisu = solu => 
    solu.tyyppi === tyypit.MUUTTUJA 
    || solu.tyyppi === tyypit.FUNKTIOKUTSU 
    || solu.tyyppi === tyypit.NUMERO
    || solu.tyyppi === tyypit.TEKSTI;

function onInfiksi(a, b, c) {
    return Boolean(a && b && c) && b.tyyppi === tyypit.INFIKSIFUNKTIOKUTSU;
}


module.exports.muunna = muunna;