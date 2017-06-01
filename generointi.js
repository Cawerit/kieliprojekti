const parseri = require('./parseri.js');
const muunnos = require('./muunnos.js');
const _ = require('lodash');

/*******************************************************************************
 * Kaikki generoinnin vaiheet yhteen kasaava moduuli
 *******************************************************************************/

module.exports = function(koodi, kohdekieli = 'javascript', { standardikirjasto }) {
  try {
    const
      parsittuStandardikirjasto = muunnos(parseri(standardikirjasto)),
      parsittuKoodi = muunnos(parseri(koodi), parsittuStandardikirjasto);

    const [generoituStandardikirjasto, standardikirjastoScope] = generoi(parsittuStandardikirjasto, kohdekieli, {
        salliStandardikirjasto: true,
        vaadiOhjelma: false,
        namespace: 'standardikirjasto'
      }),
      [generoituKoodi] = generoi(parsittuKoodi, kohdekieli, {
        salliStandardikirjasto: false,
        vaadiOhjelma: true,
        perittyScope: standardikirjastoScope
      });

    return { generoituStandardikirjasto, generoituKoodi };

  } catch (err) {
    // err.type = 'ParseriVirhe';
    throw err;
  }
};


class Scope {

  constructor(parent = null) {
    this.muuttujat = [];
    this.parent = parent;
    this.sisaisetMuuttujat = [];

    if (parent) {
      this.peritytMuuttujat = parent
        .peritytMuuttujat
        .concat(parent.muuttujat);

      this.peritytSisaisetMuuttujat = parent
        .peritytSisaisetMuuttujat
        .concat(parent.sisaisetMuuttujat);
    } else {
      this.peritytMuuttujat = [];
      this.peritytSisaisetMuuttujat = [];
    }
  }

  /**
   * Rekisteröi generoijan luoman apumuuttujan
   */
  sisainenMuuttuja(nimiEhdotus, runko) {
    const
      aiemmat =
        this.sisaisetMuuttujat
        .filter(m => m._nimiEhdotus === nimiEhdotus)
        .length,
      nimi = aiemmat > 0
        ? nimiEhdotus + '$$' + aiemmat
        : nimiEhdotus,
      solmu = {
        arvo: nimi,
        runko,
        tyyppi: 'muuttujaluonti',
        // Kertoo generoijalle että nimeä ei tarvitse obfuskoida jms
        _sisainenMuuttuja: true,
        _nimiEhdotus: nimiEhdotus
      };

    solmu.viittaukset = 0;
    // Apumuuttuja jota tullaan käyttämään hyödyksi myöhemmässä vaiheessa,
    // kun muuttujien viittauksia toisiinsa aletaan jäljittää
    solmu._edellinenViittaukset = 0;
    solmu.viittauksenKohteena = new Set();
    this.sisaisetMuuttujat.push(solmu);
    return nimi;
  }

  /**
   * Rekisteröi käyttäjän koodissa luoman muuttujan.
   * Tämän avulla voidaan muunmuassa jäljittää muuttujan
   * riippuvuussuhteita.
   */
  muuttuja(maaritys) {
    const
      { arvo } = maaritys,
      aiemmat = this.muuttujat
        .filter(m => m.arvo === arvo)
        .length;

    if (aiemmat !== 0) {
      throw new Error(`Muuttujanimi ${arvo} on määritetty kahdesti samassa rungossa`);
    }

    maaritys.viittaukset = 0;
    maaritys._edellinenViittaukset = 0;
    maaritys.viittauksenKohteena = new Set();

    this.muuttujat.push(maaritys);
  }

  viittaus({arvo}) {
    const
      onSama = m => m.arvo === arvo,
      // Etsitään mihin muuttujaan / funktioon arvo viittaa
      kohde =
        _.findLast(this.muuttujat, onSama)
        || _.findLast(this.sisaisetMuuttujat, onSama)
        || _.findLast(this.peritytMuuttujat, onSama)
        || _.findLast(this.peritytSisaisetMuuttujat, onSama);


    if (!kohde) {
      if (arvo === 'standardikirjasto') return;
      throw new Error(`Muuttuja ${arvo} ei ole määritetty`);
    }

    kohde.viittaukset++;
  }
}

function generoi(ast, kohdekieli, asetukset) {
  const generoija = require('./generointi/' + kohdekieli + '.js')(asetukset);

  const kavele = scope => {
    const kaveleRekursiivinen = solmu => {
      const koodari = generoija[solmu.tyyppi];

      if (koodari) {
        return koodari({
          solmu,
          kavele: kaveleRekursiivinen,
          uusiScope: () => kavele(new Scope(scope)),
          scope
        });
      } else {
        const err = new Error(`Ei muokkaajaa tyypille ${solmu.tyyppi}`);
        throw err;
      }
    };

    kaveleRekursiivinen.scope = scope;
    return kaveleRekursiivinen;
  };

  const scope = new Scope(asetukset.perittyScope || null);
  return [kavele(scope)(ast), scope];
}
