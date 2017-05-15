
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


module.exports.kasitteleVirhe = (virhe, koodi) => {
  if(!virhe || !virhe.sijainti) {
    return virhe;
  }

  const indeksi = virhe.sijainti.indeksi;
  const kohta = koodi.slice(0, indeksi);
  const rivinvaihdot = kohta.split('\n');
  const riviNro = rivinvaihdot.length;
  const kolumni = rivinvaihdot[rivinvaihdot.length - 1].length + 1;

  return `
Virhe koodin käsittelyssä sijainnissa ${riviNro}:${kolumni}: "${koodi[indeksi]}"
  ${virhe.message}
  `;
};
