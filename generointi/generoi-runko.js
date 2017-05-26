const _ = require('lodash');

const onAsetuslause = solmu => /luonti$/.test(solmu.tyyppi);

function generoiRunko(solmu, kavele) {
    const [asetukset, muut] = _.partition(solmu.runko, onAsetuslause);

    if (solmu.parametrit) {
      solmu.parametrit.forEach(p => {
        kavele.scope.muuttuja({ arvo: p, tyyppi: 'muuttujaluonti', runko: [] });
      });
    }

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
      });

    function lisaaRiippuvuudet(asetukset, a) {
      for (let i = 0, n = asetukset.length; i < n; i++) {
        const b = asetukset[i];
        if (b._edellinenViittaukset < b.viittaukset) {
          // Kyseiseen asetukseen on ilmestynyt uusia viittauksia a-soluun.
          // Merkataan että "b" --riippuu--> "a"
          if (b !== a) {
            b.viittauksenKohteena.add(a);
          }
          // Päivitetään property _edellinenViittaukset jotta logiikka
          // toimii myös seuraavaa muuttujaa käsiteltäessä
          b._edellinenViittaukset = b.viittaukset;
        }
      }
    }

    const asetuksetGen = asetukset.map(a => {
      // Generoidaan asetuslauseen koodi.
      // Sivuvaikutuksena joidenkin muiden muuttujien
      // "viittaukset" laskurin arvo saattaa kasvaa.
      const generoitu = kavele(a);
      lisaaRiippuvuudet(asetukset, a);
      lisaaRiippuvuudet(kavele.scope.sisaisetMuuttujat, a);

      return { generoitu, asetus: a };
    });

    // Kaikki ei-asetukset voidaan yksinkertaisesti generoida kävele-funktiolla
    const muutGen = muut.map(kavele);

    // Ei välitetä muut-listan generoinnissa tulleista viittauksista,
    // sillä muut kuin asetuslauseet tulevat joka tapauksessa viimeiseksi
    asetukset.forEach(a => a._edellinenViittaukset = a.viittaukset);

    const apumuuttujatGen = kavele.scope
        .sisaisetMuuttujat
        .map(a => {
          const generoitu = kavele(a);
          lisaaRiippuvuudet(asetukset, a);

          return { generoitu, asetus: a };
        });


    // Nyt jokaisen solun pitäisi sisältää "riippuvuudet"-listassa
    // kaikki muut saman scopen muuttujat joista se riippuu
    // Käytetään Kahnin algoritmia järjestämiseen.
    let jarjestetty = [];
    const [eiRiippuvuuksia, onRiippuvuuksia] =
      _.partition(asetuksetGen.concat(apumuuttujatGen), a => {
        const r = a.asetus.viittauksenKohteena;
        return !r || r.size === 0;
      });

    while (eiRiippuvuuksia.length !== 0) {
      const n = eiRiippuvuuksia.pop();
      jarjestetty.push(n);

      for (let i = 0; i < onRiippuvuuksia.length; i++) {
        const m = onRiippuvuuksia[i],
          {viittauksenKohteena} = m.asetus;

        if (viittauksenKohteena && viittauksenKohteena.has(n.asetus)) {
          viittauksenKohteena.delete(n.asetus);
          if (viittauksenKohteena.size === 0) {
            eiRiippuvuuksia.push(m);
          }
        }
      }
    }

    onRiippuvuuksia.forEach(m => {
      const o = m.asetus;

      if (o.viittauksenKohteena.size !== 0) {
        const eka = o.viittauksenKohteena.values().next().value;

        throw new Error(`Syklinen viittaus ${o.arvo} ja ${eka.arvo} välillä`);
      }
    });

    jarjestetty = jarjestetty.reverse();

    return jarjestetty.map(a => a.generoitu)
      .concat(muutGen)
      .map(s => s + ';\n');
}

module.exports = generoiRunko;
