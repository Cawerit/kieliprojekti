var tyypit = require('./parserityypit.js');

const poistettuArvo = Symbol('muunna/SoistettuArvo');

function muunna(ast) {
    ast.forEach((solu, indeksi) => {
        const
            edellinen = ast[indeksi-1],
            seuraava = ast[indeksi+1];
        
        if (onInfiksi(edellinen, solu, seuraava)) {
            ast[indeksi-1] = poistettuArvo;
            ast[indeksi+1] = poistettuArvo;
            
            ast[indeksi] = {
                tyyppi: tyypit.FUNKTIOKUTSU,
                arvo: solu.arvo,
                argumentit: {
                    ilmaisut: [edellinen, seuraava]
                }
            };
        } else if (solu.runko) {
            solu.runko = muunna(solu.runko);
        }
    });
    
    const ilmanTurhia = ast.filter(a => a !== poistettuArvo);
    
    if (ilmanTurhia.length !== ast.length) {
        return muunna(ilmanTurhia);
    } else {
        return ast;
    }
}

function onInfiksi(a, b, c) {
    return Boolean(a && b && c) && a.tyyppi === tyypit.MUUTTUJA && b.tyyppi === tyypit.MUUTTUJA && c.tyyppi === tyypit.MUUTTUJA;
}


module.exports.muunna = muunna;