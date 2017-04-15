var tokenTyypit = require('./tokenit.js'),
    virheet = require('./virheviestit.js'),
    apufunktiot = require('./apufunktiot.js'),
    _ = require('lodash');
 
/**
 * Tokenisointi huolehtii Ö-tiedostojen purkamisesta tokeneiksi. Tokenit toimivat välivaiheena
 * koodin muuntamisessa toiselle ohjelmointikielelle. Kaikki Ö:n kääntämiseen tarvittavat tokentyypit
 * Löytyvät tiedostosta tokenit.js.
 **/ 

module.exports.tokenisoi = function(tiedosto) {
    
  let indeksi = 0;
  const tokenit = [];

// Erilaisia apuvälineitä tokenisointiin:
  const
    numero = apufunktiot.numeroReg,
    tyhja = /\s/,
    rivinvaihto = /\n/,
    pakomerkki = '\\'
    ;
  
  const uusiToken = arvot => {
    arvot.indeksi = indeksi;
    return arvot;
  };
  
  const onNumeroPrefix = merkki => merkki === '-' || merkki === '+'; 
  
  // Itse tokenisointi tapahtuu tässä silmukassa, ja se jatkuu kunnes koko tiedosto on käyty läpi.
  while (indeksi < tiedosto.length) {
      let merkki = tiedosto[indeksi]; // Kutsutaan tällä hetkellä tarkasteltavaa indeksiä merkiksi. 
  
      // Jos merkki on sulku (avaava tai sulkeva), tokenisoidaan se suluksi.
      if (merkki === '(' || merkki === ')') {
          tokenit.push(uusiToken({
             tyyppi: tokenTyypit.SULKU,
             arvo: merkki
          }));
          
          indeksi++;
          continue;
      }
      
      // "--" Aloittaa kommentin 
      if (merkki === '-' && tiedosto[indeksi+1] === '-') {
        let rivinLoppu = tiedosto.indexOf('\n', indeksi + 2);
        if (rivinLoppu === -1) {
          rivinLoppu = tiedosto.length;
        }
        tokenit.push(uusiToken({
          tyyppi: tokenTyypit.KOMMENTTI,
          arvo: tiedosto.substring(indeksi + 2, rivinLoppu)
        }));
        
        indeksi = rivinLoppu;
        continue;
      }
      
      // Tarkistetaan mahdollinen negatiivisen numeron syntaksi merkin kohdalta
      if (onNumeroPrefix(merkki) && (!_.last(tokenit) || _.last(tokenit).tyyppi === tokenTyypit.VALI) && numero.test(tiedosto[indeksi + 1])) {
        tokenit.push(uusiToken({
          tyyppi: tokenTyypit.NUMERO,
          arvo: merkki
        }));
        
        indeksi++;
        continue;
      }
      
      //Tarkistetaan onko merkki numero
      if (numero.test(merkki)) {
          let edellinen = tokenit[tokenit.length - 1];
          
          if (edellinen && edellinen.tyyppi === tokenTyypit.NUMERO) {
              if (merkki === '.' && edellinen.arvo.includes('.')) { //Tarkistetaan onko numerossa useampi kuin yksi desimaalipiste
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
      
      //Tunnistetaan tyhjän merkin tilanteessa, onko kyseessä väli vai rivinvaihto.
      if (tyhja.test(merkki)) {
        if (rivinvaihto.test(merkki)) {
          let tyhjaTila = '';
          const indeksiAlussa = indeksi;
          
          // Kasataan kaikki rivinvaihdot yhteen, sillä kielessä rivinvaihtojen merättäinen määrä ei ole merkitsevä
          // ja "turhista" rivinvaihdoista voidaan näin päästä jo tokenisointivaiheessa eroon
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
          
          const uusiToken_ = uusiToken({
            arvo: tyhjaTila,
            tyyppi: tokenTyypit.RIVINVAIHTO
          });
          // Ilman tätä muutosta tokenin indeksiksi olisi tullut se indeksi jossa
          // oli viimeinen rivinvaihto, mutta meille hyödyllisempi on se indeksi
          // jossa rivinvaihdot alkoivat
          uusiToken_.indeksi = indeksiAlussa;
          
          tokenit.push(uusiToken_);
          
        } else {
          
          tokenit.push(uusiToken({
              tyyppi: tokenTyypit.VALI,
              arvo: merkki
          }));
          indeksi++;
        
        }
        
        continue;
      }
      
      //Jos merkki on " tai ', tunnistetaan se tekstiksi.
      if (merkki === '"') {
          let arvo = '';
          const indeksiAlussa = indeksi;
          
          indeksi++;
          merkki = tiedosto[indeksi];
          
          // Kerätään koko tekstinpätkä yhteen
          while (merkki !== '"') {
            // Jos käyttäjä on unohtanut lopettaa tekstinpätkän, heitä virhe
            if (indeksi >= tiedosto.length) {
                throw new Error(virheet.LAINAUS_PUUTTUU);
            }
            // "\" merkin avulla voi hypätä " yli niin ettei se lopeta tekstiä
            if (merkki === pakomerkki) {
              indeksi++
              merkki = tiedosto[indeksi];
              
              if (indeksi >= tiedosto.length) {
                // Tämä on virhetilanne. Annetaan ohjelman hypätä takaisin while-loopin
                // alkuun jokssa heitetään virhe tiedoston ennenaikaisen lopettamisen takia
                continue;
              }
            }
            
            arvo += merkki;
            indeksi++;
            merkki = tiedosto[indeksi];
          }
          
          const uusiToken_ = uusiToken({
              tyyppi: tokenTyypit.TEKSTI,
              arvo: arvo
          });
          uusiToken_.indeksi = indeksiAlussa;
          
          tokenit.push(uusiToken_);
          indeksi++;
          continue;
      }
      
      //Merkki = tunnistetaan asetukseksi.
      if (merkki === '=') {
          tokenit.push(uusiToken({
             tyyppi: tokenTyypit.ASETUS,
             arvo: merkki
          }));
          indeksi++;
          continue;
      }
      
      //Merkki , tunnistetaan pilkuksi.
      if (merkki === ',') {
          tokenit.push(uusiToken({
             tyyppi: tokenTyypit.PILKKU,
             arvo: ','
          }));
          indeksi++;
          continue;
      }
      
      //Apufunktioita infiksisymbolien tunnistamiseen.
      let edellinen = tokenit[tokenit.length - 1];
      const onErikoismerkki = apufunktiot.sisaltaaErikoismerkkeja(merkki);
      
      //Tunnistetaan ja merkitään infiksisymbolit symboleista erikoismerkin avulla.
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