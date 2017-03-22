var parseriTyypit = require('./parserityypit.js'),
    tokenTyypit = require('./tokenit.js');

const eiOoVali = token => token.tyyppi !== tokenTyypit.VALI;
    
function parse(tokenit, indeksi, ast) { // ast = abstract syntax tree
    let solu = tokenit[indeksi];
    
    if (solu.arvo === ')') {
        return ast;
    }
    
    if (solu.tyyppi === tokenTyypit.SYMBOLI) {
        const seuraavaIndeksi = seuraavaMerkitseva(tokenit, indeksi, eiOoVali);
        
        if (seuraavaIndeksi === -1) {
            return ast;
        }
        
        const seuraava = tokenit[seuraavaIndeksi];
        const seuraavaSeuraava = seuraavaMerkitseva(tokenit, seuraavaIndeksi, eiOoVali);
        
        if (seuraava.arvo === '(') {
            ast.push({
              tyyppi: parseriTyypit.FUNKTIOKUTSU,
              arvo: solu.arvo,
              argumentit: parse(tokenit, seuraavaSeuraava, [])
            });
        } else {
            ast.push({
               tyyppi: parseriTyypit.MUUTTUJA,
               arvo: solu.arvo,
            });
            
            if (seuraava.tyyppi === tokenTyypit.PILKKU) {
                ast = ast.concat(parse(tokenit, seuraavaSeuraava, []));
            } else if (seuraava.arvo === ')') {
                return ast;
            }
        }
    }
    
    return ast;
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
          arvo: parse(tokenit, 0, [])
      }  
    ];
};