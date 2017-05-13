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
    rungonSisennykset = [];
  
  const
    tulos = [],
    seuraava = () => (token = tiedosto[++indeksi]);
    
  function virhe(viesti) {
    const err = new Error(viesti);
    Object.assign(err, {
      sijainti: { indeksi },
      token,
      type: 'Tokenisointivirhe'
    });
    throw err;
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
  
  while(indeksi < tiedosto.length) {
    switch (token) {
      
      case '"': {
        let teksti = token;
        
        while(indeksi < tiedosto.length && token !== '"') {
          teksti += token;
          seuraava();
        }
        if (token !== '"') {
          virhe(virheet.LAINAUS_PUUTTUU)
        }
        
        tulos.push(teksti);
        seuraava();
        break;
      }
    
      case '--': {
        indeksi = tiedosto.indexOf('\n', indeksi);
        if (indeksi === -1) {
          indeksi = tiedosto.length;
        } else {
          seuraava();
        }
        break;
      }
      
      case '\n': {
        
        if (rungonSisennykset.length > 0) {
          const edellinen = _.last(rungonSisennykset);
          if (laskeSisennys(indeksi) <= edellinen) {
            tulos.push(' }%%% %%%; ');
            rungonSisennykset.pop();
          } 
        } else {
          tulos.push(' %%%; ');
        }
        
        seuraava();
        break;
      }
      
      // Sisennyksiä tarvitsee käsitellä vain asetuslauseiden jälkeen!
      case '=': {
        // Etsitään mistä nykyinen rivi on alkanut
        let rivinAlku = indeksi;
        while(rivinAlku > 0 && tiedosto[rivinAlku] !== '\n') {
          rivinAlku--;
        }
        
        // Lasketaan monellako välillä rivi alkoi
        tulos.push(' = %%%{ ');
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
  
  
  return '%%%{ ' + tulos.join('') + ' }%%%';
}