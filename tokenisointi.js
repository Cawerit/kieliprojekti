var tokenTyypit = require('./tokenit.js'),
    virheet = require('./virheviestit.js'),
    apufunktiot = require('./apufunktiot.js'),
    _ = require('lodash');
 

module.exports.tokenisoi = function(tiedosto) {
    
  let indeksi = 0;
  const tokenit = [];

  const
    numero = apufunktiot.numeroReg,
    tyhja = /\s/;
  const rivinvaihto = /\n/;
  
  const uusiToken = arvot => {
    arvot.indeksi = indeksi;
    return arvot;
  };
  
  const onNumeroPrefix = merkki => merkki === '-' || merkki === '+'; 
  
  while (indeksi < tiedosto.length) {
      let merkki = tiedosto[indeksi];
  
      
      if (merkki === '(' || merkki === ')') {
          tokenit.push(uusiToken({
             tyyppi: tokenTyypit.SULKU,
             arvo: merkki
          }));
          
          indeksi++;
          continue;
      }
      
      // Tarkistetaan mahdollinen negatiivisen numeron syntaksi
      if (onNumeroPrefix(merkki) && (!_.last(tokenit) || _.last(tokenit).tyyppi === tokenTyypit.VALI) && numero.test(tiedosto[indeksi + 1])) {
        tokenit.push(uusiToken({
          tyyppi: tokenTyypit.NUMERO,
          arvo: merkki
        }));
        
        indeksi++;
        continue;
      }
      
      if (numero.test(merkki)) {
          let edellinen = tokenit[tokenit.length - 1];
          
          if (edellinen && edellinen.tyyppi === tokenTyypit.NUMERO) {
              if (merkki === '.' && edellinen.arvo.includes('.')) {
                throw new Error(virheet.PISTEVIRHE);
              }
              
              edellinen.arvo += merkki;
          } else {
              tokenit.push(uusiToken({
                 tyyppi: tokenTyypit.NUMERO,
                 arvo: merkki
              }));
          }
          
          indeksi++;
          continue;
      }
      
      if (tyhja.test(merkki)) {
        if (rivinvaihto.test(merkki)) {
          let tyhjaTila = '';
          
          while(indeksi < tiedosto.length && rivinvaihto.test(merkki)) {
            let seuraavaRivinVaihto = tiedosto.indexOf('\n', indeksi + 1);
            if (seuraavaRivinVaihto === -1) {
              seuraavaRivinVaihto = tiedosto.length - 1;
            }
            
            const rivi = tiedosto.substring(indeksi, seuraavaRivinVaihto);
            
            if (rivi.trim().length === 0) {
              tyhjaTila += rivi;
              indeksi = seuraavaRivinVaihto;
            } else {
              tyhjaTila += merkki;
              indeksi++;
            }
            
            merkki = tiedosto[indeksi];
          }
          
          tokenit.push(uusiToken({
            arvo: tyhjaTila,
            tyyppi: tokenTyypit.RIVINVAIHTO
          }));
          
        } else {
          
          tokenit.push(uusiToken({
              tyyppi: tokenTyypit.VALI,
              arvo: merkki
          }));
          indeksi++;
        
        }
        
        continue;
      }
      
      if (merkki === '"') {
          let arvo = '';
          
          indeksi++;
          merkki = tiedosto[indeksi];
          
          while(merkki !== '"') {
              // Jos käyttäjä on unohtanut lopettaa tekstinpätkän, heitä virhe
              if (indeksi >= tiedosto.length) {
                  throw new Error(virheet.LAINAUS_PUUTTUU);
              }
              
              arvo += merkki;
              indeksi++;
              merkki = tiedosto[indeksi];
          }
          
          tokenit.push({
              tyyppi: tokenTyypit.TEKSTI,
              arvo: arvo
          });
          indeksi++;
          continue;
      }
      
      if (merkki === '=') {
          tokenit.push(uusiToken({
             tyyppi: tokenTyypit.ASETUS,
             arvo: merkki
          }));
          indeksi++;
          continue;
      }
      
      if (merkki === ',') {
          tokenit.push(uusiToken({
             tyyppi: tokenTyypit.PILKKU,
             arvo: ','
          }));
          indeksi++;
          continue;
      }
      
      let edellinen = tokenit[tokenit.length - 1];
      const onErikoismerkki = apufunktiot.sisaltaaErikoismerkkeja(merkki);
      
      if (edellinen && (edellinen.tyyppi === tokenTyypit.SYMBOLI || edellinen.tyyppi === tokenTyypit.INFIKSISYMBOLI)) {
          edellinen.arvo += merkki;
          
          if (onErikoismerkki) {
            edellinen.tyyppi = tokenTyypit.INFIKSISYMBOLI;
          }
      } else {
          tokenit.push(uusiToken({
              tyyppi: onErikoismerkki ? tokenTyypit.INFIKSISYMBOLI : tokenTyypit.SYMBOLI,
              arvo: merkki
          }));
      }
      
      indeksi++;
  }
  
  
  return tokenit;
}