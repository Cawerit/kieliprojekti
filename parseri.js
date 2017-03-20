var parseriTyypit = require('./parserityypit.js'),
    tokenTyypit = require('./tokenit.js');
    
    
function parse(tokenit, indeksi, ast) { // ast = abstract syntax tree
    let solu = tokenit[indeksi];
    
    if (solu.arvo === ')') {
        return ast;
    }
    
    if (solu.tyyppi === tokenTyypit.SYMBOLI) {
        const seuraava = tokenit[indeksi + 1];
        
        if (seuraava && seuraava.arvo === '(') {
            ast.push({
              tyyppi: parseriTyypit.FUNKTIOKUTSU,
              arvo: solu.arvo,
              argumentit: parse(tokenit, indeksi + 2, []) // Apufunktio parseArgumentit()?
            });
        } else {
            ast.push({
               tyyppi: parseriTyypit.MUUTTUJA,
               arvo: solu.arvo,
            });
            
            if (seuraava.tyyppi === tokenTyypit.PILKKU) {
                ast = ast.concat(parse(tokenit, indeksi + 2, []));
            } else if (seuraava.arvo === ')') {
                return ast;
            }
        }
    }
    
    return ast;
}



module.exports.parse = function(tokenit) {
    return [
      {
          tyyppi: parseriTyypit.OHJELMA,
          arvo: parse(tokenit, 0, [])
      }  
    ];
};