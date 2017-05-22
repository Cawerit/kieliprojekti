
const virheet = {
  LAINAUS_PUUTTUU: 'Lainaus puuttuu!!',
  PISTEVIRHE: 'Pistevirhe!!',
  HUONO_LAUSEKELISTAN_ALOITUS: 'Lausekelistan tulee alkaa "(" merkillä',
  ODOTTAMATON_ILMAISUN_LOPETUS: 'Odottamaton ilmaisun lopetus',
  LASKETTUJA_ARVOJA_PARAMETREISSA: 'Laskettuja arvoja parametreissa',
  GENEROINTI_TARVITSEE_OHJELMAN: 'Generointi tarvitsee ohjelman',
  SYNTAKSIVIRHE_INFIKSIN_LUONNISSA: 'Syntaksivirhe infiksin luonnissa',
  ODOTTAMATON_ASETUSLAUSE: 'Asetuslause vaatii muuttujan tai funktion johon arvo asetetaan',
  ASETUS_EI_OLE_ILMAISU: 'Asetuksen oikeanpuolisen arvon tulee olla yksinkertainen ilmaisu',
  SEKALAISET_VALIMERKIT: 'Käytä sisennyksiä pelkästään välilyöntejä tai sarkaimia!',
  PUUTTUVA_INFIKSIFUNKTIO: 'Infiksifunktiota ei löydy'
};


module.exports = virheet;

const merkki = (i, koodi) => {
  return koodi[i] || '';
};

module.exports.kasitteleVirhe = (virhe, koodi) => {
  let msg = virhe.message;
  
  if (virhe.type === 'TokenisointiVirhe') {
    const i = virhe.sijainti.indeksi;
    // Tämä virhe tulee esitokenisointivaiheessa
    return `Virhe ohjelman tokenisoinnissa: odottamaton merkki "${merkki(i, koodi)}" kohdassa ${i}`;
  } else if (virhe.type === 'ParseriVirhe') {
    // Tämä virhe tulee Nearley-parserilta.
    // Yritetään parsia Nearleyn virheviestistä relevantti ilmoitus
    // ja positio koodista. Virhettä ei tee mieli suoraan näyttää
    // käyttäjälle koska esikäsittelyn jäljilta koodi on melko
    // obfuskoitunutta.
    
    // Yritetään lukea viestistä kodat:
    // "Invalid syntax at line x col y" ja
    // "Unexpected z"
    // jotta saadaan kohta koodissa ja ongelman aiheuttama merkki
    const 
      sijainti = msg.match(/invalid syntax at line ([0-9]+) col ([0-9]+)/),
      selitys = msg.match(/Unexpected (.*)/);
    
    if (sijainti) {
      // Nearleyn saamassa koodissa on vain yksi rivi,
      // selvitetään alkuperäinen rivi kolumnin perusteella
      let col = parseInt(sijainti[2]);
      
      if (!isNaN(col)) {
        let
          riviNro = 0,
          pos = 0,
          rivit = koodi.split('\n');
          
        for (let rivi of rivit) {
          riviNro++;
          const pos_ = pos + rivi.length;
          if (pos_ > col) {
            // Tässä on oikea kohta
            col = col - pos;
            break;
          } else {
            pos = pos_;  
          }
        }
      
        msg = `Virhe ohjelman tokenisoinnissa: odottamaton ${selitys[1]} rivillä ${riviNro}, kolumnissa ${col}`;
      }
    }

    return msg;
  } else {
    return virhe;
  }
};

