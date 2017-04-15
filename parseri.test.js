var tokenTyypit = require('./tokenit.js');
var parserityypit = require('./parserityypit.js');
var parseri = require('./parseri.js');

test('parsii yksinkertaisen funktioluonnin oikein', () => {
    // Mallinnetaan tokeneilla seuraava koodi:
    // a(b) = b + 1
    const tokenit = [
      { tyyppi: tokenTyypit.SYMBOLI, arvo: 'a' },
      { tyyppi: tokenTyypit.SULKU, arvo: '(' },
      { tyyppi: tokenTyypit.SYMBOLI, arvo: 'b' },
      { tyyppi: tokenTyypit.SULKU, arvo: ')' },
      { tyyppi: tokenTyypit.VALI, arvo: ' ' },
      { tyyppi: tokenTyypit.ASETUS, arvo: '=' },
      { tyyppi: tokenTyypit.SYMBOLI, arvo: 'b' },
      { tyyppi: tokenTyypit.VALI, arvo: ' ' },
      { tyyppi: tokenTyypit.INFIKSISYMBOLI, arvo: '+' },
      { tyyppi: tokenTyypit.VALI, arvo: ' ' },
      { tyyppi: tokenTyypit.NUMERO, arvo: '1' }
    ];
    
    const tulos = [
        { 
            tyyppi: parserityypit.FUNKTIOLUONTI,
            arvo: 'a',
            parametrit: { ilmaisut: [ [ { tyyppi: parserityypit.MUUTTUJA, arvo: 'b' } ] ], sisaltaaLaskettujaArvoja: false },
            runko: [
                { tyyppi: parserityypit.MUUTTUJA, arvo: 'b' },
                { tyyppi: parserityypit.INFIKSIFUNKTIOKUTSU, arvo: '+' },
                { tyyppi: parserityypit.NUMERO, arvo: '1' }
            ]
        }
    ];
    
    expect(parseri.parse(tokenit)).toEqual(ohjelma(tulos));
});

// Pieni apufunktio joka tekee testeissä helpompaa mallintaa
// vain merkitsevää osaa ohjelmasta
function ohjelma(ast) {
    return [{
      tyyppi: parserityypit.OHJELMA,
      runko: ast  
    }];
}