var parseriTyypit = require('./parserityypit.js'),
    tokenTyypit = require('./tokenit.js'),
    virheet = require('./virheviestit.js'),
    _ = require('lodash')
  ;

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
        tulos.tyyppi = parseriTyypit.PILKKU;
        return tulos;
      }

      if (token.tyyppi === tokenTyypit.SYMBOLI) {
        tulos.tyyppi = parseriTyypit.MUUTTUJA;
        return tulos;
      }
      
      if (token.tyyppi === tokenTyypit.NUMERO) {
        tulos.tyyppi = parseriTyypit.NUMERO;
        return tulos;
      }
      
      if (token.tyyppi === tokenTyypit.TEKSTI) {
        tulos.tyyppi = parseriTyypit.TEKSTI;
        return tulos;
      }
      
      if (token.tyyppi === tokenTyypit.INFIKSISYMBOLI) {
        tulos.tyyppi = parseriTyypit.INFIKSIFUNKTIOKUTSU;
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
            const tulos = parseIlmaisu(_.last(tokenit));
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

    /**
     * Käsittelee koodin sulkujen sisältä
     */
    function parseArgumenttiTaiParametriLista() {
      if (token.arvo !== '(') {
        throw new Virhe(virheet.HUONO_LAUSEKELISTAN_ALOITUS);
      }

      const tulos = {
        ilmaisut: [],
        sisaltaaLaskettujaArvoja: false
      };

      seuraava();
      
      ulompi:
      while(indeksi < tokenit.length && token) {
        let ilmaisunOsat = [];
        do {
          if (token.arvo === ')') {
            tulos.ilmaisut.push(ilmaisunOsat);
            seuraava();
            break ulompi;  
          }
          let ilmaisunOsa = parseIlmaisu(ilmaisunOsat[ilmaisunOsat.length - 1]);
          if (ilmaisunOsa) {
            ilmaisunOsat.push(ilmaisunOsa);
          }
          
          seuraava();
        } while (indeksi < tokenit.length && token && token.tyyppi !== tokenTyypit.PILKKU);
        
        tulos.ilmaisut.push(ilmaisunOsat);
        seuraava();
      }
      
      // Tarkista sisältääkö tulos laskettuja arvoja (mitä tahansa muuta kuin muuttujanimiä)
      // Tätä tietoa käytetään myöhemmässä parsinnan vaiheessa jos kyseessä on funktioluonti:
      // funktion parametreissa lasketut arvot eivät ole järkeviä, esim: `funktionimi(1, 2) = 1 + 2` ei ole järkevä.
      if(!tulos.sisaltaaLaskettujaArvoja) {
        for (const ilmaisunOsat of tulos.ilmaisut) {
          if (ilmaisunOsat.length !== 1 || ilmaisunOsat[0].tyyppi !== parseriTyypit.MUUTTUJA) {
            tulos.sisaltaaLaskettujaArvoja = true;  
          }
        }
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
