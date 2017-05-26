const beautify = require('js-beautify').js_beautify,
  apufunktiot = require('../apufunktiot.js'),
  _ = require('lodash');

module.exports = asetukset => {
  const muuttuja = apufunktiot
    .muuttujanimiGeneraattori(asetukset.salliStandardikirjasto ? ['standardikirjasto'] : []);

  // Pieni apufunktio funktion rungon muodostamiseen
  const muodostaRunko = (solmu, kavele) => {
    const runko = solmu.runko.map(kavele).map(s => s + ';\n');

    if (runko.length > 0) {
      runko[runko.length - 1] = 'return ' + runko[runko.length - 1];
    }

    return runko;
  };
  
  const onAsetuslause = solmu => /luonti$/.test(solmu.arvo);

  const funktioluonti = ({ solmu, uusiScope }) => {
    const
      kavele      = uusiScope(),
      parametrit  = solmu.parametrit.map(muuttuja),
      nimi        = solmu.arvo ? muuttuja(solmu.arvo) : '',
      [asetukset, muut] = _.partition(solmu.runko, onAsetuslause);
    
    //
    // Seuraava vaihe on muuttujien järjestäminen.
    //
    // olkoot a = b + c
    // olkoot c = 5
    // olkoot b = c
    //
    // Tällöin riippuvuudet voidaan kuvata seuraavasti
    //
    //      c
    //      ^
    //   ---|-- b
    //  |       ^
    //  a ------|
    //
    // Tavoitteena on järjestää asetukset järjestykseen
    //
    // olkoot c = 5
    // olkoot b = c
    // olkoot a = b + c
    //
    // käyttäen topologista järjestämisalgoritmia
    // (https://en.wikipedia.org/wiki/Topological_sorting).
    // Näin koodi toimii imperatiiviseen kieleen käännettynäkin.
    //
    
    
    // Rekisteröidään kaikki asetuslauseet scopeen niin
    // että niihin tehtyjä viittauksia voidaan seurata
    asetukset
      .forEach(a => {
        kavele.scope.muuttuja(a);
        // Apumuuttuja jota tullaan käyttämään hyödyksi seuraavassa vaiheessa,
        // kun muuttujien viittauksia toisiinsa aletaan jäljittää
        a._edellinenViittaukset = a.viittaukset;
        a.riippuvuudet = [];
      });
    
    const asetuksetGen = asetukset.map(a => {
      // Generoidaan asetuslauseen koodi.
      // Sivuvaikutuksena joidenkin muiden muuttujien
      // "viittaukset" laskurin arvo saattaa kasvaa.
      const generoitu = kavele(a);
      
      for (let i = 0, n = asetukset.length; i < n; i++) {
        const b = asetukset[i];
        if (b.edellinenViittaukset < b.viittaukset) {
          // Kyseiseen asetukseen on ilmestynyt uusia viittauksia a-soluun.
          // Merkataan että "b" --riippuu--> "a"
          if (b !== a) {
            b.riippuvuudet.push(a);
          }
          // Päivitetään property _edellinenViittaukset jotta logiikka
          // toimii myös seuraavaa muuttujaa käsiteltäessä
          b._edellinenViittaukset = b.viittaukset;
        }
      }
      
      return { generoitu, asetus: a };
    });
    
    // Nyt jokaisen solun pitäisi sisältää "riippuvuudet"-listassa
    // kaikki muut saman scopen muuttujat joista se riippuu
    // Käytetään Kahnin algoritmia järjestämiseen.
    const jarjestetty = [];
    const [eiRiippuvuuksia, onRiippuvuuksia] =
      _.partition(asetuksetGen, a => a.riippuvuudet.length === 0);
      
    while (eiRiippuvuuksia.length !== 0) {
      const n = eiRiippuvuuksia.pop();
      jarjestetty.push(n);
      
    }
    
    // Kaikki ei-asetukset voidaan yksinkertaisesti generoida kävele-funktiolla  
    const
      muutGen         = muut.map(kavele),
      apumuuttujatGen = kavele.scope.muuttujat.map(kavele);

    const runko = asetuksetGen
      .concat(apumuuttujatGen)
      .concat(muutGen)
      .map(s => s + ';\n');

    if (runko.length > 0) {
      runko[runko.length - 1] = 'return ' + runko[runko.length - 1];
    }

    // Jos argumentit ovat [a, b, c],
    // Niin luodaan funktio
    // function (a) { return function(b) { return function(c) { runko } } }

    if (parametrit.length === 0) {
      parametrit.push('');
    }

    return _.reduceRight(parametrit, (edellinen, seuraava) => {
      const sisalto = edellinen === null
        ? runko.join(' ')
        : `return ${edellinen}`;

      return `function ${nimi} (${seuraava}) { ${sisalto} }`;
    }, null);
  };

  return {

    ohjelma(kavely) {
      const solmu = kavely.solmu,
        tulos = solmu.runko.map(kavely.kavele).map(x => x + ';').join('\n'),
        ohjelmaNimi = muuttuja('ohjelma'),
        tilaNimi = muuttuja('tila');

      return beautify(asetukset.vaadiOhjelma === false
        ? tulos
        : `
(function() {
${tulos}
;

if (typeof ${ohjelmaNimi} !== 'function' || typeof ${tilaNimi} === 'undefined') {
  throw new Error('Ö-ohjelma vaatii funktion nimeltä "ohjelma" ja tilan');
} else {
  standardikirjasto.suorita(${ohjelmaNimi}, ${tilaNimi});
}
})();

    `);
    },

    funktioluonti,

    infiksifunktioluonti: funktioluonti,

    lambda: funktioluonti,

    muuttujaluonti({solmu, kavele}) {
      // Apufunktio joka turvaa muuttujanimen jos solmua ei ole
      // määritetty generoinnin "sisäiseksi" muuttujaksi
      const luoMuuttuja = solmu._sisainenMuuttuja ? _.identity : muuttuja;

      if (solmu.runko.length === 1 && solmu.runko[0].tyyppi !== funktioluonti) {
        return `var ${luoMuuttuja(solmu.arvo)} = ${kavele(solmu.runko[0])}`;
      } else {
        const runko = muodostaRunko(solmu, kavele);

        return `var ${luoMuuttuja(solmu.arvo)} = (function (){ ${runko} })()`;
      }
    },

    muuttuja({solmu}) {
      return muuttuja(solmu.arvo);
    },

    infiksifunktio({solmu}) {
      return muuttuja(solmu.arvo);
    },

    numero({solmu}) {
      return solmu.arvo;
    },

    /**
    * Konditionaalien rakenne:
    * `kun x on y niin .. on z niin .. tai e muutoin`
    */
    sovituslausejoukko({solmu, kavele, scope}) {
      const arvo = scope.muuttuja('$ehtolause_arvo', [solmu.arvo]);

      const vertailut = solmu.runko.map(s => {
        const
          ehto  = kavele(s.ehto),
          tulos = kavele(s.arvo);

        return `standardikirjasto.vrt(${ehto}, ${arvo}) ? (${tulos})`;
      }).join(' : ');

      return vertailut + ` : ${ kavele(solmu.oletusArvo) }`;
    },

    funktiokutsu({solmu, kavele}) {
      const arvo = kavele(solmu.arvo);
      let argumentit = solmu.argumentit.map(kavele);

      if (arvo === 'standardikirjasto') {
        argumentit = '(' + argumentit.join(', ') + ')';
      } else {
        argumentit = argumentit.map(x => '(' + x + ')').join('');
      }

      return arvo + argumentit;
    },

    teksti({solmu}) {
      return JSON.stringify(solmu.arvo);
    },

    ilmaisu({solmu, kavele}) {
      return kavele(solmu.runko[0]);
    },
    
    totuusarvo({solmu}) {
      return solmu.arvo.toString();
    }
    
  };
};
