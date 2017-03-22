var parseriTyypit = require('./parserityypit.js'),
    tokenTyypit = require('./tokenit.js');

const eiOoVali = token => token.tyyppi !== tokenTyypit.VALI;
    
function parse(tokenit) {
    let indeksi = 0;
    
    return parseRekursiivinen();
    
    function parseRekursiivinen() {
        let ast = [];
        let solu = tokenit[indeksi];
        
        if (solu.arvo === ')') {
            indeksi++;
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
                
                const tulos = {
                  arvo: solu.arvo,
                  argumentit: parseRekursiivinen()
                };
                
                const seuraavaSeuraava = seuraavaMerkitseva(tokenit, indeksi, eiOoVali);
                
                if (tokenit[seuraavaSeuraava] && tokenit[seuraavaSeuraava].tyyppi === tokenTyypit.ASETUS) {
                    tulos.tyyppi = parseriTyypit.FUNKTIOLUONTI;
                } else {
                    tulos.tyyppi = parseriTyypit.FUNKTIOKUTSU;
                }
                
                ast.push(tulos);
                
            } else {
                ast.push({
                   tyyppi: parseriTyypit.MUUTTUJA,
                   arvo: solu.arvo,
                   
                });
                
                if (seuraava.tyyppi === tokenTyypit.PILKKU) {
                    
                    indeksi = seuraavaMerkitseva(tokenit, seuraavaIndeksi, eiOoVali);
                    ast = ast.concat(parseRekursiivinen());
                    
                } else {
                    indeksi++;
                }
            }
        }
        
        return ast;
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
          arvo: parse(tokenit)
      }  
    ];
};