const
  _       = require('lodash'),
  virheet = require('./virheviestit.js');
/******************************************************************************
 * Suorittaa tarvittavat jälkikäsittelyt parserin muodostamalle AST:lle.
 * Käytännössä muuntajalle jää tehtäväksi järjestää infiksifunktiot
 * presedenssin mukaan.
 ******************************************************************************/
const
  lens = indeksi => (obj, arvo) => {
    return arvo === undefined ?
      obj.argumentit[indeksi]
      : (obj.argumentit[indeksi] = arvo);
  },
  vasen = lens(0),
  oikea = lens(1);


function muunna(ast, tuotuAst) {

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
  // vastaamaan niiden oikeaa arvojärjestystä:
  //      +
  //     / \
  //    a   *
  //       / \
  //      b   c
  //
  function muunnaRekursiivinen(solu, infiksifunktiot) {
    if (onInfiksiKutsu(solu)) {
      // Peräkkäiset infiksikutsut rakentuvat parserissa aina siten että
      // solun oikealla puolella on jokin ilmaisu (ei infiksikutsu) ja
      // vasemmalla puolella on toinen infiksikutsu.
      // Aloitetaan keräämällä kaikki peräkkäiset infiksikutsut listaan.
      const perakkaiset = [vasen(solu), solu];
      let edellinen = oikea(solu);
      while (onInfiksiKutsu(edellinen)) {
        perakkaiset.push(vasen(edellinen), edellinen);
        edellinen = oikea(edellinen);
      }
      perakkaiset.push(edellinen);

      const rakennaPuu = (lista) => {
        if (lista.length === 1) {
          return lista[0];
        }

        if (lista.length === 0) {
          // Näin ei pitäisi käydä, mutta tämä bugi on tullut aiemmin vastaan (ja myös korjattu),
          // ja mikäli tätä tarkistusta ei tehdä, kyseinen bugi ilmenee erittäin ikävänä
          // ikuisena looppina / Maximum call stack size exceeded virheenä
          const viesti = 'Infiksifunktioita ei pystytty järjestämään. \n' +
            'Tämä on luultavasti bugi kääntäjässä, ei suoritettavassa koodissa. \n' +
            'Ongelma saattaa kuitenkin kadota lisäämällä sulkuja joidenkin infiksifunktiokutsujen ympärille.';
          throw new Error(viesti);
        }

        let pieninIndeksi = -1, pieninPresedenssi;
        for (let i = 0, n = lista.length; i < n; i++) {
          const a = lista[i];
          if (onInfiksiKutsu(a)) {
            const
              arvo = a.arvo.arvo,
              inf = infiksifunktiot.get(arvo);

            if (!inf) {
              virhe(`Infiksifunktiota ${arvo} ei löydy`);
            }

            if (pieninIndeksi === -1 || pieninPresedenssi > inf.presedenssi) {
              pieninIndeksi = i;
              pieninPresedenssi = inf.presedenssi;
            }
          }
        }

        const pienin = lista[pieninIndeksi],
          // Lista vasemmanpuoleisista funktiokutsuista
          a = lista.slice(0, pieninIndeksi),
          // Lista oikeanpuoleisista funktiokutsuista
          b = lista.slice(pieninIndeksi + 1);

        // Jaotellaan myös vasen ja oikea puoli funktiokutsuja rekursiivisesti
        vasen(pienin, rakennaPuu(a));
        oikea(pienin, rakennaPuu(b));

        return pienin;
      };

      return rakennaPuu(perakkaiset);
    } else {
      if (solu.runko) {
        if (solu.tyyppi === 'ilmaisu') {
          // Parseri palauttaa tavalliset sulkeilla ympäröidyt ilmaisut käärittynä
          // { tyyppi: "ilmaisu", runko: [a] } tyyppiseen objektiin.
          // Normaalisti tällaista toimenpidettä ei edes tarvittaisi, sillä ilmaisun
          // runko itsessään kertoo kaiken käännöksessä tarvittavan.
          // Ylimääräinen objekti helpottaa kuitenkin tämän muuntajan työtä, sillä
          // näin muuntajan algoritmi ei sekoita sulkeilla ympäröidyn ilmaisun
          // siältöä viereisten ilmaisujen kanssa, vaan se voidaan käsitellä omana
          // irrallisena kokonaisuutenaan:
          solu = muunnaRekursiivinen(solu.runko[0], infiksifunktiot);
        } else {
          // Luodaan uusi "scope" infiksifunktioille jotka määritetään tässä rungossa
          const rungonInfiksifunktiot = new Map(infiksifunktiot);
          asetaUudetInfiksifunktiot(rungonInfiksifunktiot);
          // Kutsutaan tätä metodia rekursiivisesti funktion rungolle
          solu.runko = solu.runko.map(__ => muunnaRekursiivinen(__, rungonInfiksifunktiot));
        }
      }

      if (solu.argumentit) {
        // Kutsutaan tätä metodia rekursiivisesti funktion argumenteille
        solu.argumentit = solu.argumentit.map(__ => muunnaRekursiivinen(__, infiksifunktiot));
      }

      // Kutsutaan tätä metodia rekursiivisesti esimerkiksi ilmaisun arvolle
      if (_.isObject(solu.arvo)) solu.arvo = muunnaRekursiivinen(solu.arvo, infiksifunktiot);

      return solu;
    }
  }

  const infiksifunktiot = new Map();
  if (tuotuAst) {
    asetaUudetInfiksifunktiot(tuotuAst.runko, infiksifunktiot);
  }
  asetaUudetInfiksifunktiot(ast.runko, infiksifunktiot);
  ast.runko = ast.runko.map(__ => muunnaRekursiivinen(__, infiksifunktiot));

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
