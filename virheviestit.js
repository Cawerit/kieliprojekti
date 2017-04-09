
const virheet = {
  LAINAUS_PUUTTUU: 'Lainaus puuttuu!!',
  PISTEVIRHE: 'Pistevirhe!!',
  HUONO_LAUSEKELISTAN_ALOITUS: 'Lausekelistan tulee alkaa "(" merkillä',
  ODOTTAMATON_ILMAISUN_LOPETUS: 'Odottamaton ilmaisun lopetus',
  LASKETTUJA_ARVOJA_PARAMETREISSA: 'Laskettuja arvoja parametreissa'
};


module.exports = virheet;


module.exports.kasitteleVirhe = (virhe, koodi) => {
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
