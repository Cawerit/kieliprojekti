var _ = require('lodash');
var virheet = require('./virheviestit.js');

/******************************************************************************
 * Esitokenisointi muuntaa ö-tiedostosta saadun koodin (parserille) luettavaan
 * muotoon. Rivinvaihdot ja tarvittavat sisennyksit muunnetaan erikoismerkeiksi,
 * sekä merkkijonot ja kommentit käsitellään tässä vaiheessa omiksi asioikseen,
 * jotta niiden käsittely (parserissa) helpottuisi.
 ******************************************************************************/

module.exports = esikasittele;

function esikasittele(tiedosto) {
  let
    indeksi = 0,
    token = tiedosto[indeksi],
    valittuValimerkki,
    rungonSisennykset = [],
    sulkeidenSisalla = 0;

  const
    tulos = [],
    seuraava = () => (token = tiedosto[++indeksi]);

  const
    RUNKO_ALKU  = '{',
    RUNKO_LOPPU = '}',
    YHTASUURUUS = '=',
    LAINAUS     = '"',
    KOMMENTTI   = '--',
    RIVINVAIHTO = '\n';

  function virhe(viesti) {
    const err = new Error(viesti);
    Object.assign(err, {
      sijainti: { indeksi },
      token,
      type: 'TokenisointiVirhe'
    });
    throw err;
  }

  function tyhjennaRungot() {
    const sisennykset = rungonSisennykset;
    rungonSisennykset = [];

    return sisennykset.map(_.constant(` ${RUNKO_LOPPU} `)).join('');
  }

  // Apufunktio. Rupeaa laskemaan sisennyksen määrää annetusta rivin alusta.
  function laskeSisennys(rivinAlku) {
    rivinAlku++;
    let valit = 0;
    while(tiedosto[rivinAlku] === ' ' || tiedosto[rivinAlku] === '\t') {
      if (valittuValimerkki === undefined) {
        valittuValimerkki = tiedosto[rivinAlku];
      } else if(tiedosto[rivinAlku] !== valittuValimerkki) { // Tarkistaa, että tiedostossa käytetään aina samaa välimerkkiä sisennyksen ilmaisemiseen (välilyönti tai sarkain).
        virhe(virheet.SEKALAISET_VALIMERKIT);
      }

      valit++;
      rivinAlku++;
    }
    return valit;
  }

  function tyhjaRivi(indeksi) {
    if (indeksi < tiedosto.length) {
      let rivinLoppu = tiedosto.indexOf(RIVINVAIHTO, indeksi);

      if (rivinLoppu === -1) {
        rivinLoppu = tiedosto.length;
      }

      return tiedosto.slice(indeksi, rivinLoppu).trim().length === 0;
    } else {
      return true;
    }
  }

  while(indeksi < tiedosto.length) {
    switch (token) {

      case "(": case ")": {
        sulkeidenSisalla += (token === '(' ? 1 : -1);
        tulos.push(token);
        seuraava();
        break;
      }

      case LAINAUS: {
        let teksti = token;

        seuraava();
        while(indeksi < tiedosto.length && token !== LAINAUS) {
          teksti += token;
          if (token === '\\') {
            seuraava();
            if (indeksi < tiedosto.length) {
              teksti += token;
            } else {
              virhe(virheet.LAINAUS_PUUTTUU);
            }
          }

          seuraava();
        }
        if (token !== LAINAUS) {
          virhe(virheet.LAINAUS_PUUTTUU)
        }

        tulos.push(teksti + LAINAUS);
        seuraava();
        break;
      }

      case KOMMENTTI[0]: {
        if (tiedosto[indeksi + 1] === KOMMENTTI[1]) {
          indeksi = tiedosto.indexOf(RIVINVAIHTO, indeksi);
          if (indeksi === -1) {
            indeksi = tiedosto.length;
          } else {
            seuraava();
          }
        } else {
          tulos.push(token);
          seuraava();
        }
        break;
      }

      case RIVINVAIHTO: {
        if (rungonSisennykset.length > 0 && !tyhjaRivi(indeksi + 1) && sulkeidenSisalla <= 0) {
          const sisennys = laskeSisennys(indeksi);

          while(rungonSisennykset.length > 0) {
            if (sisennys <= _.last(rungonSisennykset)) {
              tulos.push(RUNKO_LOPPU);
              tulos.push(' ');
              rungonSisennykset.pop();
              continue;
            } else {
              tulos.push(' ');
              break;
            }
          }
        }

        seuraava();
        break;
      }

      // Sisennyksiä tarvitsee käsitellä vain asetuslauseiden jälkeen!
      case YHTASUURUUS: {
        // Etsitään mistä nykyinen rivi on alkanut
        let rivinAlku = indeksi;
        while(rivinAlku > 0 && tiedosto[rivinAlku] !== RIVINVAIHTO) {
          rivinAlku--;
        }

        tulos.push(`${YHTASUURUUS} ${RUNKO_ALKU}`);

        // Lasketaan monellako välillä rivi alkoi
        rungonSisennykset.push(laskeSisennys(rivinAlku));
        seuraava();
        break;
      }

      default: {
        tulos.push(token);
        seuraava();
        break;
      }
    }
  }


  return RUNKO_ALKU +tulos.join('') + tyhjennaRungot() + RUNKO_LOPPU;
}
