const
  _       = require('lodash'),
  virheet = require('./virheviestit.js');
/******************************************************************************
 * Suorittaa tarvittavat jälkikäsittelyt parserin muodostamalle AST:lle.
 * Käytännössä muuntajalle jää tehtäväksi järjestää infiksifunktiot
 * presedenssin mukaan.
 ******************************************************************************/

function muunna(ast) {

  function virhe(viesti, solu) {
    const err = Object.assign(new Error(viesti), { solu });
    throw err;
  }

  // Infiksifunktiot voivat määrittää itselleen arvojärjestyksen, eli presedenssin,
  // joka määrittää missä järjestyksessä rinnakkaiset infiksikutsut suoritetaan.
  //
  // Otetaan esimerkiksi seuraava Ö-kielinen koodi:
  //    a + b * c
  // Parseri muodostaa tästä koodista seuraavaa rakennetta muistuttavan puun:
  //
  //       *
  //     /  \
  //    +    c
  //   / \
  //  a   b
  //
  // Toisin kuin useissa muissa kielissä, Ö-kielessä * ja + eivät ole varattuja
  // operaattoreita, vaan lähdekoodissa (tässä tapauksessa standardikirjasssa)
  // määritettyjä infiksifunktioita. Arvojärjestys on selvitettävä etsimällä
  // ast-puusta näiden infiksifunktioiden määrittely.
  // Oletetaan tässä esimerkissä että näiden funktioiden arvojärjestys on
  // esimerkiksi seuraava:
  // ___op___|___presedenssi___
  //    +            1
  //    *            2
  //
  // Kun kyseessä on joukko peräkkäisiä infiksifunktiokutsuja, suuremman
  // presedenssin omaava funktio tulee surittaa ensin. Ylläkuvatussa
  // ast-puussa kuitenkin ensimmäisenä suoritetaan uloin funktiokutsu,
  // eli "1 + 2".
  //
  // Seuraavaksi siis järjestetään nämä peräkkäiset infiksikutsut uudelleen
  // vastaamaan niiden oikeaa arvojärjestystä.

  function muunnaRekursiivinen(solu, infiksifunktiot) {
    if (onInfiksiKutsu(solu)) {
      // Peräkkäiset infiksikutsut rakentuvat parserissa aina siten että
      // solun oikealla puolella on jokin ilmaisu (ei infiksikutsu) ja
      // vasemmalla puolella on toinen infiksikutsu.
      // Aloitetaan keräämällä kaikki peräkkäiset infiksikutsut listaan.
      const perakkaiset = [solu];
      let edellinen = solu.argumentit[0];
      while (onInfiksiKutsu(edellinen)) {
        perakkaiset.push(edellinen);
        edellinen._indeksi = perakkaiset.length - 1;
        edellinen = edellinen.argumentit[0];
      }

      // Seuraavaksi etsitään kaikki nämä infiksifunktiot
      // kulkemalla AST:ta takaisin ylöspäin

      const puuttuvaMaarittely = _.find(perakkaiset, f => !infiksifunktiot.has(f.arvo));
      if (puuttuvaMaarittely) {
        virhe(virheet.PUUTTUVA_INFIKSIFUNKTIO, solu);
      }

      const jarjestetty =
        _.sortBy(perakkaiset, f => infiksifunktiot.get(f.arvo).presedenssi);

      _.tail(jarjestetty)
        .reduce((edellinen, seuraava) => {
          const
            viereinen = perakkaiset[seuraava._indeksi + 1];

          console.log('woop', viereinen);

          if (viereinen) {
            seuraava.argumentit[0] = viereinen.argumentit[1];
            seuraava.argumentit[1] = edellinen;
          }

          return seuraava;
        }, jarjestetty[0]);

      console.log(_.tail(jarjestetty));

    } else {
      if (solu.runko) {
        // Luodaan uusi "scope" infiksifunktioille jotka määritetään tässä rungossa
        const rungonInfiksifunktiot = new Map(infiksifunktiot);
        asetaUudetInfiksifunktiot(rungonInfiksifunktiot);

        // Kutsutaan tätä metodia rekursiivisesti funktion rungolle
        for (const s of solu.runko) muunnaRekursiivinen(s, rungonInfiksifunktiot);
      }

      if (solu.argumentit) {
        // Kutsutaan tätä metodia rekursiivisesti funktion argumenteille
        for (const a of solu.argumentit) muunnaRekursiivinen(a, infiksifunktiot);
      }

      // Kutsutaan tätä metodia rekursiivisesti esimerkiksi ilmaisun arvolle
      if (typeof solu.arvo === 'object') muunnaRekursiivinen(solu.arvo, infiksifunktiot);
    }
  }

  const infiksifunktiot = new Map();
  asetaUudetInfiksifunktiot(ast.runko, infiksifunktiot);
  for (const a of ast.runko) muunnaRekursiivinen(a, infiksifunktiot);

  return ast;
}

function onInfiksiKutsu(solu) {
  return !!solu && solu.tyyppi === 'funktiokutsu' && !!solu.infiksi;
}

function onInfiksiLuonti(solu) {
  return !!solu && solu.tyyppi === 'infiksifunktioluonti';
}

function asetaUudetInfiksifunktiot(runko, map) {
  for (const s of runko) {
    if (onInfiksiLuonti(s)) {
      map.set(s.arvo, s);
    }
  }
}

module.exports = muunna;
