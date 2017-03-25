var parseriTyypit = require('./parserityypit.js'),
    tokenTyypit = require('./tokenit.js');

const eiOoVali = token => token.tyyppi !== tokenTyypit.VALI;
    
function parse(tokenit) {
    let indeksi = 0;
    
    let turvaraja = 30;
    
    let bJalkeen = false;
    
    return parseRekursiivinen();
    
    function parseRekursiivinen() {
        let ast = [];
        let solu = tokenit[indeksi];
        
        console.log('parse rekursiivinen alkaa', indeksi, solu);
        
        if(--turvaraja < 0) {
            return new Error('failfail');
        }
        
        if (solu.arvo === ')') {
            console.log('sulkukiiniiiiii');
            indeksi++;
            console.log(tokenit[indeksi]);
            return ast;
        }
        
        if (solu.tyyppi === tokenTyypit.SYMBOLI) {
            const seuraavaIndeksi = seuraavaMerkitseva(tokenit, indeksi, eiOoVali);
            
            if (seuraavaIndeksi === -1) {
                return ast;
            }
            
            let seuraava = tokenit[seuraavaIndeksi];
            
            if (seuraava.arvo === '(') {
                
                indeksi = seuraavaMerkitseva(tokenit, seuraavaIndeksi, eiOoVali);
                
                console.log('funktio argumentit alkaa', indeksi);
                
                const tulos = {
                  arvo: solu.arvo,
                  argumentit: parseRekursiivinen()
                };
                
                console.log('funktio argumentit loppuu', indeksi);
                
                const seuraavaSeuraava = seuraavaMerkitseva(tokenit, indeksi, eiOoVali);
                
                if (tokenit[seuraavaSeuraava] && tokenit[seuraavaSeuraava].tyyppi === tokenTyypit.ASETUS) {
                    
                    indeksi = seuraavaSeuraava + 1;
                    tulos.tyyppi = parseriTyypit.FUNKTIOLUONTI;
                    tulos.runko = parseRekursiivinen();
                    
                } else {
                    
                    tulos.tyyppi = parseriTyypit.FUNKTIOKUTSU;
                    
                }
                
                ast.push(tulos);
                
            } else {
                ast.push({
                   tyyppi: parseriTyypit.MUUTTUJA,
                   arvo: solu.arvo,
                   
                });
                
                console.log('muuttuja', solu);
                
                if (seuraava.tyyppi === tokenTyypit.PILKKU) {
                    
                    indeksi = seuraavaMerkitseva(tokenit, seuraavaIndeksi, eiOoVali);
                    ast = ast.concat(parseRekursiivinen());
                    
                } else {
                    if (solu.arvo === 'b') {
                        bJalkeen = true;
                    }
                    indeksi++;
                }
            }
        }
        
        if (solu.tyyppi === tokenTyypit.VALI) {
            console.log('väli', indeksi, tokenit.length);
            indeksi++;
        }
        
        if (bJalkeen) {
            console.log('b jalkeennn', indeksi, ast);
            bJalkeen =false;
        }
        
        console.log()
        
        // Jatka tai lopeta
        const valitulos = indeksi < tokenit.length ? ast.concat(parseRekursiivinen()) : ast;
        return valitulos;
    }
}


function seuraavaMerkitseva(tokenit, indeksi, onMerkitseva) {
    while(++indeksi < tokenit.length) {
        if (onMerkitseva(tokenit[indeksi])) {
            return indeksi;
        } 
    }
    return -1;
}


module.exports.parse = function(tokenit) {
    return [
      {
          tyyppi: parseriTyypit.OHJELMA,
          runko: parse(tokenit)
      }  
    ];
};