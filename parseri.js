var parseriTyypit = require('./parserityypit.js'),
    tokenTyypit = require('./tokenit.js'),
    virheet = require('./virheviestit.js'),
    _ = require('lodash')
  ;

function parse(tokenit) {
    
    let indeksi = 0, token = tokenit[indeksi];

    const seuraava = () => token = tokenit[++indeksi];
    const infiksiAvainsana = 'infiksi';
    
    const ohita = tyypit => {
      do { seuraava(); } while(token && tyypit.indexOf(token.tyyppi) !== -1);
    };

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
        this.sijainti = { indeksi: token ? token.indeksi : 0 };
      }
      toString() {
        return "Virhe: " + this.message;
      }
    }
    
    /**
     * Parsii "rungoksi" kutsuttavan rakenteen, joka on kaikki tokenit
     * nykyisestä indeksistä alkaen siihen asti että sisennyksen taso
     * palaa taaksepäin.
     * 
     * ```
     * --------------------------------------|
     * foo(x) =   --------------|            |
     *   1 + 2                  | foo runko  | Ohjelman runko
     *   bar(y) = -|            |            |
     *     x + y   | bar runko  |            |
     * baz(x)                                |
     * 1 + 2                                 |
     * 
     *```
     * 
     * @param {Array=} [runkoAluksi] Valinnainen lähtökohta rungolle
     * @return {Array} AST
     */
    function parseRunko(runkoAluksi) {
      const runko = runkoAluksi || [];
      
      let sisennys = 0;
      // Tarkistetaan mikä on tämänhetkinen sisennyksen taso
      for(let i = indeksi; i >= 0; i--) {
        const m = tokenit[i];
        if (m.tyyppi === tokenTyypit.VALI) {
          sisennys++;
        } else if(m.tyyppi === tokenTyypit.RIVINVAIHTO) {
          break;
        } else {
          sisennys = 0;
        }
      }
      
      while(indeksi < tokenit.length) {
        if (tokenit[indeksi].tyyppi === tokenTyypit.RIVINVAIHTO) {
          // Tarkistetaan että rivinvaihdon jälkeen on säilytetty sisennys
          let i = 1;
          while((indeksi + i) < tokenit.length && tokenit[indeksi + i].tyyppi === tokenTyypit.VALI) i++;
          i--;
          
          // Jos sisennys on pienempi kuin funktioluonnin rungossa kuuluisi olla, lopetetaan funktion rungon parsinta
          indeksi += i;
          token = tokenit[indeksi];
          if (i <= sisennys || i >= tokenit.length) {
            break;
          }
        }
        
        const tulos = parseIlmaisu(_.last(runko));
        if (tulos) {
          runko.push(tulos);
        }
        seuraava();
      }
      
      return runko;
    }
    
    function parseInfiksifunktioluonti() {
      ohita([tokenTyypit.VALI]);
      if (!token || token.tyyppi !== tokenTyypit.NUMERO) {
        throw new Virhe(virheet.SYNTAKSIVIRHE_INFIKSIN_LUONNISSA);
      }
      
      const tulos = {
        tyyppi: parseriTyypit.INFIKSIFUNKTIOLUONTI,
        presedenssi: parseFloat(token.arvo)
      };
      
      ohita([tokenTyypit.VALI]);
      
      if (token.tyyppi !== tokenTyypit.INFIKSISYMBOLI) {
        throw new Virhe(virheet.SYNTAKSIVIRHE_INFIKSIN_LUONNISSA);
      }
      
      tulos.arvo = token.arvo;
      
      seuraava();
      
      const runko = [{
        arvo: tulos.arvo,
        tyyppi: parseriTyypit.MUUTTUJA
      }];
      
      while(indeksi < tokenit.length) {
        const tulos = parseIlmaisu(_.last(runko));
        if (tulos) {
          runko.push(tulos);
        }
        seuraava();
      }
      
      tulos.runko = runko;
      return tulos;
    }

    /**
     * Funktio joka sisältää suurimman osan parsinnan logiikasta.
     * Käsittelee eri tokentyypit ja muodostaa nistä AST:n.
     * Käytännössä muut funktiot tässä tiedostossa kutsuvat
     * tätä funktiota eri tavoin.
     * 
     * @param {Object=} [edellinen] Valinnainen edellinen parseIlmaisu-funktiokutsun tulos.
     *        HUOM! Joissain tapauksissa, kuten funktioluonneissa, tämä funktio muokkaa
     *        edellisen ast noden sisältöä.
     */
    function parseIlmaisu(edellinen) {
      turvaraja();

      const tulos = {
        arvo: token.arvo
      };

      if (token.tyyppi === tokenTyypit.VALI || token.tyyppi === tokenTyypit.KOMMENTTI) {
        return;
      }
      
      if (token.tyyppi === tokenTyypit.PILKKU) {
        tulos.tyyppi = parseriTyypit.PILKKU;
        return tulos;
      }

      // Muuttuja tai "infiksi" avainsana
      if (token.tyyppi === tokenTyypit.SYMBOLI) {
        
        if (token.arvo === infiksiAvainsana) {
          return parseInfiksifunktioluonti();
        }
        
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

          edellinen.runko = parseRunko();
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
    
    
    return parseRunko();
    
}

module.exports.parse = function(tokenit) {
    return [
      {
          tyyppi: parseriTyypit.OHJELMA,
          runko: parse(tokenit)
      }
    ];
};
