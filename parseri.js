var parseriTyypit = require('./parserityypit.js'),
    tokenTyypit = require('./tokenit.js'),
    virheet = require('./virheviestit.js');

function parse(tokenit) {
    
    let indeksi = 0, token = tokenit[indeksi];

    const seuraava = () => token = tokenit[++indeksi];

    // Debuggauksessa käytetty raja joka estää ikuisten looppien tulon vahingossa
    const turvaraja = (() => {
      let raja = 100;
      return () => {
        if (--raja <= 0) {
          throw new Virhe('Liian monta kierrosta');
        }
      };
    })();
    
    // Virhe joka heitetään jos parsinta failaa
    class Virhe {
      constructor(viesti) {
        this.message = viesti;
        this.sijainti = { indeksi: token.indeksi };
      }
    }

    const ast = [];
    while(indeksi < tokenit.length) {
      const tulos = parseIlmaisu(ast[ast.length - 1]);
      if (tulos) {
        ast.push(tulos);
      }
      seuraava();
    }
    return ast;

    function parseIlmaisu(edellinen) {
      turvaraja();

      const tulos = {
        arvo: token.arvo
      };

      if (token.tyyppi === tokenTyypit.VALI) {
        return;
      }
      
      if (token.tyyppi === tokenTyypit.PILKKU) {
        return parseriTyypit.PILKKU;
      }

      if (token.tyyppi === tokenTyypit.SYMBOLI) {
        tulos.tyyppi = parseriTyypit.MUUTTUJA;
        return tulos;
      }

      if (token.tyyppi === tokenTyypit.ASETUS) {
        if (edellinen && edellinen.tyyppi === parseriTyypit.FUNKTIOKUTSU) {
          if (edellinen.argumentit.sisaltaaLaskettujaArvoja) {
            throw new Virhe(virheet.LASKETTUJA_ARVOJA_PARAMETREISSA);
          }

          // Muutetaan edellinen funktiokutsusta funktion luonniksi
          edellinen.tyyppi = parseriTyypit.FUNKTIOLUONTI;
          edellinen.parametrit = edellinen.argumentit;
          edellinen.argumentit = undefined;

          const runko = [];
          while(indeksi < tokenit.length) {
            const tulos = parseIlmaisu(runko[runko.length - 1]);
            if (tulos) {
              runko.push(tulos);
            }
            seuraava();
          }

          edellinen.runko = runko;
          return;
        }
      }

      if (token.tyyppi === tokenTyypit.SULKU) {
        if (token.arvo === '(') {

          if (edellinen.tyyppi === parseriTyypit.MUUTTUJA) {
            edellinen.tyyppi = parseriTyypit.FUNKTIOKUTSU;
            edellinen.argumentit = parseArgumenttiTaiParametriLista();
            return;
          } else {
            return Object.assign(parseArgumenttiTaiParametriLista(), {
              tyyppi: parseriTyypit.ILMAISULISTA
            });
          }

        } else {
          throw new Virhe(virheet.ODOTTAMATON_ILMAISUN_LOPETUS);
        }
      }
    }

    function parseArgumenttiTaiParametriLista() {
      if (token.arvo !== '(') {
        throw new Virhe(virheet.HUONO_LAUSEKELISTAN_ALOITUS);
      }

      const tulos = {
        ilmaisut: [],
        sisaltaaLaskettujaArvoja: false
      };

      seuraava();
      while(indeksi < tokenit.length && token && token.arvo !== ')') {
        let ilmaisunOsat = [];
        do {
          console.log('inception', ilmaisunOsat[ilmaisunOsat.length - 1], token);
          let ilmaisunOsa = parseIlmaisu(ilmaisunOsat[ilmaisunOsat.length - 1]);
          if (ilmaisunOsa) {
            ilmaisunOsat.push(ilmaisunOsa);
          }
          seuraava();
        } while (indeksi < tokenit.length && token && token.tyyppi !== parseriTyypit.PILKKU);
        tulos.ilmaisut.push(ilmaisunOsat);
        
        console.log('wooo', ilmaisunOsat);
        seuraava();
      }

      return tulos;
    }
}

module.exports.parse = function(tokenit) {
    return [
      {
          tyyppi: parseriTyypit.OHJELMA,
          runko: parse(tokenit)
      }
    ];
};
