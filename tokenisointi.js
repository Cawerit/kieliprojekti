var tokenTyypit = require('./tokenit.js'),
    virheet = require('./virheviestit.js');

module.exports.tokenisoi = function(tiedosto) {
    
  let indeksi = 0;
  const tokenit = [];

  const numero = /[0-9]/;
  const tyhja = /\s/;
  
  while (indeksi < tiedosto.length) {
      let merkki = tiedosto[indeksi];
      
      if (merkki === '(' || merkki === ')') {
          tokenit.push({
             tyyppi: tokenTyypit.SULKU,
             arvo: merkki
          });
          
          indeksi++;
          continue;
      }
      
      if (numero.test(merkki)) {
          let edellinen = tokenit[tokenit.length - 1];
          
          if (edellinen && edellinen.tyyppi === tokenTyypit.NUMERO) {
              edellinen.arvo += merkki;
          } else {
              tokenit.push({
                 tyyppi: tokenTyypit.NUMERO,
                 arvo: merkki
              });
          }
          
          indeksi++;
          continue;
      }
      
      if (tyhja.test(merkki)) {
          tokenit.push({
              tyyppi: tokenTyypit.VALI,
              arvo: merkki
          });
          
        indeksi++;
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
          tokenit.push({
             tyyppi: tokenTyypit.YHTASUURUUS,
             arvo: merkki
          });
          indeksi++;
          continue;
      }
      
      if (merkki === ',') {
          tokenit.push({
             tyyppi: tokenTyypit.PILKKU,
             arvo: ','
          });
          indeksi++;
          continue;
      }
      
      let edellinen = tokenit[tokenit.length - 1];
      if (edellinen && edellinen.tyyppi === tokenTyypit.SYMBOLI) {
          edellinen.arvo += merkki;
      } else {
          tokenit.push({
              tyyppi: tokenTyypit.SYMBOLI,
              arvo: merkki
          });
      }
      
      indeksi++;
  }
  
  
  return tokenit;
}