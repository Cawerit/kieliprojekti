var fs = require('fs');
var path = require('path');
var parseri = require('./parseri.js');
var muunnos = require('./muunnos.js');

class Scope {

  constructor() {
    this.muuttujat = [];
  }

  muuttuja(nimiEhdotus, runko) {
    const aiemmat = this.muuttujat.filter(m => m._nimiEhdotus === nimiEhdotus).length,
      nimi = aiemmat.length > 0
        ? nimiEhdotus += '$$' + aiemmat.length
        : nimiEhdotus,
      solmu = {
        arvo: nimi,
        runko,
        _nimiEhdotus: nimiEhdotus
      };

    this.muuttujat.push(solmu);
    return nimi;
  }

  uusi() {
    const s = new Scope();
    s.muuttujat = this.muuttujat.slice();
    return s;
  }

}

module.exports = function(koodi, kohdekieli = 'javascript') {
  try {
    const
      standardikirjastoJs = fs.readFileSync(path.join(__dirname, 'kirjastot', 'standardikirjasto.js'), 'utf8'),
      standardikirjasto = fs.readFileSync(path.join(__dirname, 'kirjastot', 'standardikirjasto.ö'), 'utf8'),
      parsittuStandardikirjasto = muunnos(parseri(standardikirjasto)),
      parsittuKoodi = muunnos(parseri(koodi), parsittuStandardikirjasto);

    const generoituStandardikirjasto = generoi(parsittuStandardikirjasto, kohdekieli, {
        salliStandardikirjasto: true,
        vaadiOhjelma: false
      }),
      generoituKoodi = generoi(parsittuKoodi, kohdekieli, {
        salliStandardikirjasto: false,
        vaadiOhjelma: true
      });

    return standardikirjastoJs + '\n\n' + generoituStandardikirjasto + '\n\n' + generoituKoodi;

  } catch (err) {
    // err.type = 'ParseriVirhe';
    throw err;
  }
};

function generoi(ast, kohdekieli, asetukset) {
  const generoija = require('./generointi/' + kohdekieli + '.js')(asetukset);

  const kavele = scope => {
    const kaveleRekursiivinen = solmu => {
      const koodari = generoija[solmu.tyyppi];

      if (koodari) {
        return koodari({
          solmu,
          kavele: kaveleRekursiivinen,
          uusiScope: () => kavele(scope.uusi()),
          scope
        });
      } else {
        const err = new Error(`Ei muokkaajaa tyypille ${solmu.tyyppi}`);
        console.log(err);
        throw err;
      }
    };

    kaveleRekursiivinen.scope = scope;
    return kaveleRekursiivinen;
  };

  return kavele(new Scope())(ast);
}
