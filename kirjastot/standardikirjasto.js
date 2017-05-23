var standardikirjasto; // Ö-kielen standardikirjasto

(function() {
    var tyypit = {
      LISTA: 'lista',
      KOKOELMA: 'kokoelma'
    };
    
    ////////////////////////////////////////////////////////////////////////////
    //
    // Yleiset funktiot
    //
    ///////////////////////////////////////////////////////////////////////////
    /**
     * Yhteenlasku numeroilla
     */
    var summaa  = fn('+', ['numero', 'numero'], function(a, b){ return a + b; });

    /**
     * Vähennyslasku numeroilla
     */
    var vahenna  = fn('-', ['numero', 'numero'], function(a, b){ return a - b; });

    /**
     * Jakolasku numeroilla
     */
    var jaa = fn('/', ['numero', 'numero'], function(a, b){ return a / b; });
    /**
     * Yhdistää kaksi tekstiä toisiinsa
     */
    var yhdistaTekstit = fn('++', ['teksti', 'teksti'], function(a, b) { return a + b; });
    
    var etsiIndeksi = fn('etsiIndeksi', ['funktio', tyyppiOn('lista')], function(fn, lista){
      var data = lista._data;
      for (var i = 0, n = data.length; i < n; i++) {
        if (fn(data[i])) {
          return i;
        }
      }
      
      return -1;
    });
    
    var etsi = fn('etsi', ['funktio', tyyppiOn('lista')], function(fn, lista) {
      var tulos = etsiIndeksi(fn, lista);
      if (tulos === -1) return new EiMitaan();
      else return tama(tulos);
    });

    var T = function() { return true; };

    /**
    * Kahden arvon samanarvoisuutta testaava funktio
    */
    function on(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;

        if (typeof a === 'object' && typeof b === 'object') {
            if (a.constructor !== b.constructor) return false;
            var proto = Object.getPrototypeOf(a);
            // Tämän kirjaston sisällä on voitu ylikirjoittaa
            // arvolle "_on" funktio, joka hoitaa tarkistuksen
            // arvon samanarvoisuudesta.
            if (typeof proto._on === 'function') {
                return proto._on.call(a, b);
            }
            var keysA = Object.keys(a);
            var keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;

            for(var i = 0, n = keysA.length; i < n; i++) {
                var key = keysA[i];
                // Tarkistetaan rekursiivisesti ovatko myös
                // kaikki objektin sisältämät arvot samanarvoisia.
                if(!on(a[key], b[key])) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }

    function pituus (jono) {
        if (typeof jono === 'string' || Array.isArray(jono)) {
            return Array.from(jono).length;
        } else {
            argumenttiVirhe('pituus', 0, jono, 'Teksti tai Lista');
        }
    }

    var jos = fn('jos', ['totuusarvo', T], function(ehto, laiskaArvo) {
        if(ehto) {
            return new Tama(typeof laiskaArvo === 'function' ? laiskaArvo() : laiskaArvo);
        } else {
            return new EiMitaan();
        }
    });

    var ja = fn('&&', ['totuusarvo', 'totuusarvo'], function(a, b){ return a && b; });

    var tai = fn('||', ['totuusarvo', 'totuusarvo'], function(a, b){ return a || b; });

    var suurempi = fn('>', ['numero', 'numero'], function(a, b){ return a > b; });

    var pienempi = fn('<', ['numero', 'numero'], function(a, b){ return a < b; });
    
    var muokkaa = fn('|', [tyyppiOn(tyypit.KOKOELMA), constr(Pari)], function(obj, pari){
      var
        uusiData = [],
        data = obj._data,
        avain = pari._lueIndeksi(0),
        osuma = false;
      
      for (var i = 0, n = data.length; i < n; i++) {
        var d = data[i];
        if (!osuma && on(avain, d._lueIndeksi(0))) {
          uusiData.push(new Pari(avain, pari._lueIndeksi(1)));
          osuma = true;
        } else {
          uusiData.push(d);
        }
      }
      
      if (!osuma) {
        uusiData.push(new Pari(avain, pari._lueIndeksi(1)));
      }
      
      var k = kokoelma();
      k._data = uusiData;
      return k;
    });

    function muutoin(ehkaArvo, taiSitten) {
        if (!ehkaArvo || !(ehkaArvo instanceof Ehka)) {
            argumenttiVirhe('muutoin:', 0, ehkaArvo, 'tämä(arvo) tai eiMitään');
        } else if (taiSitten === undefined) {
            argumenttiVirhe('muutoin:', 1, taiSitten, 'jotakin');
        } else {
            return ehkaArvo instanceof Tama ? ehkaArvo.arvo
              : typeof taiSitten === 'function' ? taiSitten() : taiSitten;
        }
    }

    /**
    * Funktio jota generoitu koodi kutsuu konditionaalirakenteessa
    * `kun oikeaArvo on odotettuArvo niin ..`
    *
    * Ö kieli ei tue funktioiden vertailua normaaliin vertailuun
    * tarkoitetulla `on:`-funktiolla. Mikäli `odotettuArvo` on funktio,
    * palautusarvo on `odotettuArvo(oikeaArvo)`, eli käyttäjä voi helposti
    * siirtää tarkistuksen jollekin toiselle funktiolle.
    * Muussa tapauksessa tulos on normaalilla vertailulla
    * tehty `on(odotettuArvo, oikeaArvo)`.
    *
    * @private
    */
    function vertaaEhtoArvoja(odotettuArvo, oikeaArvo) {
      return typeof odotettuArvo === 'function' ?
        odotettuArvo(oikeaArvo)
        : on(odotettuArvo, oikeaArvo);
    }

    ////////////////////////////////////////////////////////////////////////////
    //
    // Tyyppiluokat
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
    * @class Ehkä
    *
    * Abstrakti luokka "Ehka" muistuttaa hieman Haskellin "Maybe"-tyyppiluokkaa.
    * Luokka "Tama" paketoi jonkin arvon ja luokan "EiMitaan" instanssi merkkaa
    * vuorostaan puuttuvaa arvoa.
    * Kaikki kolme JS luokkaa ovat lähinnä tämän kirjaston sisäistä toimintaa
    * varten: Ö-koodista niitä käsitellään Ö-funktioiden kautta.
    */
    function Ehka () {}
    function Tama (arvo) { Ehka.call(this); this.arvo = arvo; }
    function EiMitaan () { Ehka.call(this); }

    var onArvo = fn('onArvo', [constr(Ehka)], function(a) {
      return a instanceof Tama;
    });

    var ehka = fn('ehkä', ['funktio', constr(Ehka)], function(fn, a) {
      return onArvo(a) ? new Tama(fn(a)) : new EiMitaan();
    });

    function tekstiksi(a) {
      return Array.isArray(a) ?
        a.map(tekstiksi).join(', ')
        : typeof a === 'string' ? JSON.stringify(a)
        : a.toString();
    }

    // Luokat "Tama" ja "EiMitaan" perivät
    // abstraktin luokan "Ehka".
    // Tämä helpottaa tarkistuksia joissa halutaan tietää
    // onko arvo "Ehka"-tyyppinen; a instanceof Ehka
    Tama.prototype = Object.create(Ehka.prototype);
    EiMitaan.prototype = Object.create(Ehka.prototype);
    Tama.prototype.constructor = Tama;
    EiMitaan.prototype.constructor = EiMitaan;

    Tama.prototype.toString = function() { return 'tämä(' + tekstiksi(this.arvo) + ')'; };
    Tama.prototype._lueIndeksi = function(indeksi) { return lueIndeksi(this.arvo, indeksi); };
    EiMitaan.prototype.toString = function() { return 'eiMitaan'; };
    EiMitaan.prototype._lueIndeksi = function() { return null; }

    /**
    * Tämän kirjaston sisäisiin equals-tarkistuksiin
    * tarkoitettu funktio, jota "on"-funktio kutsuu.
    */
    Tama.prototype._on = function(b) { return !!b && b instanceof Tama && on(b.arvo, this.arvo); };
    EiMitaan.prototype._on = function(b) { return !!b && b instanceof EiMitaan; };

    var tama = fn('tämä', [T], function(a) { return new Tama(a); });

    var arvo = fn('arvo', [constr(Tama)], function(a){ return a.arvo; });

    function Pari(a, b) {
      this[0] = a;
      this[1] = b;
    }
    Pari.prototype.toString = function() { return '(' + tekstiksi(this[0]) + ' : ' + tekstiksi(this[1]) + ')'; };
    Pari.prototype._lueIndeksi = function(indeksi) {
      if (indeksi !== 0 && indeksi !== 1) {
        argumenttiVirhe('@', 1, indeksi, '0 tai 1');
      } else {
        return this[indeksi];
      }
    };

    var pari = fn(':', [T, T], function(a, b) { return new Pari(a, b); });

    /**
     * Listat
     * TODO: Parempi toteutus, linked list?
     */
    function lista(alkio) {
      var l = function(alkio) {
        var uusi = lista(alkio);
        uusi._data = l._data.concat(uusi._data);
        uusi._syklinen = l._syklinen;
        
        return uusi;
      };
      
      l._data = [alkio];
      l._tyyppi = tyypit.LISTA;
      l.toString = lista_toString;
      l._lueIndeksi = lista_lueIndeksi;
      l._syklinen = false;
      return l;
    }
    
    function silmukka(l) {
      var uusi = lista();
      uusi._data = l._data;
      uusi._syklinen = true;
      return uusi;
    }

    function lista_toString() {
      return 'lista(' + tekstiksi(this._data) + ')';
    }

    function lista_lueIndeksi(i) {
      if (i >= this._data.length) {
        if (this._syklinen) {
          return lista_lueIndeksi.call(this, i - this._data.length);
        } else {
          return undefined;
        }
      } else {
        return this._data[i]; 
      }
    }

    function kokoelma(pari) {
      var k = function(pari) {
        k._data.push(pari);
        return k;
      };
      k._data = [pari];
      k._tyyppi = tyypit.KOKOELMA;
      k.toString = kokoelma_toString;
      k._lueIndeksi = kokoelma_lueIndeksi;
      return k;
    }

    function kokoelma_toString() {
      return 'kokoelma(' + tekstiksi(this._data) + ')';
    }

    function kokoelma_lueIndeksi(indeksi) {
      for (var i = 0, n = this._data.length; i < n; i++) {
        if (on(this._data[i][0], indeksi)) {
          return this._data[i][1];
        }
      }
    }

    function lueIndeksi(listaTaiKokoelma, indeksi) {
      let tulos;
      if (typeof listaTaiKokoelma._lueIndeksi === 'function') {
        tulos = listaTaiKokoelma._lueIndeksi(indeksi);
      } else {
        argumenttiVirhe('@', 0, listaTaiKokoelma, 'lista, kokoelma tai pari');
      }

      return tulos == null ? new EiMitaan() : new Tama(tulos);
    }

    /**
    * @class Komento
    *
    * Komentojen konsepti on Ö-kielessä hieman samanlainen kuin Elmissä.
    * Ö-ohjelmat voivat mallintaa sivuvaikutuksia palauttamalla "komentoja",
    * jotka Ö:n suorittava koodi sitten toteuttaa.
    */
    function Komento(tehtava, tilanMuokkaus) {
        this._tehtava = tehtava;
        this._tilanMuokkaus = tilanMuokkaus;
    }

    Komento.prototype.tehtava = function(vanhaTila) {
      try {
          var tulos = this._tehtava(vanhaTila);
          return Promise.resolve(tulos);
      } catch (err) {
          return Promise.reject(err);
      }
    };

    Komento.prototype.tilanMuokkaus = function(komennonTulos, vanhaTila) {
        if (typeof this._tilanMuokkaus === 'function') {
            try {
                return this._tilanMuokkaus(komennonTulos);
            } catch (err) {
                console.log(err);
            }
        }

        return vanhaTila;
    };

    ////////////////////////////////////////////////////////////////////////////
    //
    // Komennot
    //
    ///////////////////////////////////////////////////////////////////////////

    function kysy(kysymys, tilanMuokkaus) {
        return new Komento(function() {
            return new Promise(function(resolve) {
                var readline = require('readline');
                var rl = readline.createInterface({
                  input: process.stdin,
                  output: process.stdout
                });
                rl.question(kysymys, function(vastaus) {
                    resolve(vastaus);
                    rl.close();
                });
            });
        }, tilanMuokkaus);
    }

    function nayta(viesti) {
        return new Komento(function() { console.log(tekstiksi(viesti)); }, undefined);
    }

    var sitten = fn('sitten:', [constr(Komento), 'funktio'], function(a, b) {
      var tilaBJalkeen;
      return new Komento(function(vanhaTila) {
        return a.tehtava(vanhaTila)
          .then(function(tulos) {
            var uusiTila = a.tilanMuokkaus(tulos, vanhaTila);
            var bKomento = b(uusiTila);
            
            return bKomento
              .tehtava(uusiTila)
              .then(function(tulos) {
                tilaBJalkeen = bKomento.tilanMuokkaus(tulos, uusiTila);
                return tulos;
              });
          });
      }, function() {
        return tilaBJalkeen;
      });
    });

    var
      symbolTuettu = typeof Symbol !== 'undefined',
      LOPETA_TOKEN = symbolTuettu ? Symbol('komennot/lopeta') : function() {/* Komento: Lopeta */},
      JATKA_TOKEN  = symbolTuettu ? Symbol('komennot/jatka') : function() {/* Komento: Jatka */},
      lopeta = new Komento(function() { return LOPETA_TOKEN; }),
      jatka = new Komento(function() { return JATKA_TOKEN; });

    function tyyppi(a) {
        switch(typeof a) {
            case 'number': return 'numero';
            case 'string': return 'teksti';
            case 'object':
              if (a !== null && a.toString !== Object.prototype.toString) {
                return a.toString();
              } else {
                return 'objekti';
              }
            case 'function': return 'funktio';
            case 'boolean': return 'totuusarvo';
        }
    }

    function argumenttiVirhe(nimi, indeksi, argumentti, tyyppi) {
        throw new Error(`Huono argumentti funktioon ${nimi}. ` +
          `Argumentin ${indeksi + 1} pitäisi olla tyyppiä ${tyyppi}, mutta se oli ${tekstiksi(argumentti)}`);
    }

    function fn(nimi, argTyypit, f) {
        return function() {
            var args = Array.prototype.slice.call(arguments);
            for(var i = 0, n = args.length; i < n; i++) {
                var virhe = args[i] == null || (typeof argTyypit[i] === 'string' ?
                  argTyypit[i] !== tyyppi(args[i])
                  : !(argTyypit[i](args[i])));

                if (virhe) {
                    argumenttiVirhe(nimi, i, args[i], argTyypit[i]);
                }
            }
            return f.apply(this, args);
        }
    }

    // Pieni apufunktio joka palauttaa testausfunktion
    // arvon prototyypin testaamiseen
    function constr(c) {
      var res = function(arvo) {
        return arvo instanceof c;
      };
      res.toString = function() {
        return c.name || c.toString();
      };
      return res;
    }
    
    function tyyppiOn(t) {
      var res = function(arvo) {
        return arvo._tyyppi === t;
      };
      res.toString = function() {
        return t;
      };
      
      return res;
    }
 
    function suorita(ohjelma, tila) {
        try {
            var tulos = ohjelma(tila);
            if (tulos && tulos instanceof Komento) {
                var tehtavanTulos = tulos.tehtava(tila);
                tehtavanTulos.then(function(t) {
                    if (t !== LOPETA_TOKEN) {
                      var uusiTila = tulos.tilanMuokkaus(t, tila);
                      if (!on(uusiTila, tila) || t === JATKA_TOKEN) {
                        setTimeout(function() {
                          suorita(ohjelma, uusiTila);
                        });
                      }
                    }
                });
            }
        } catch (virhe) {
            console.log(virhe);
        }
    }

    var api = {
        summaa: summaa,
        vahenna: vahenna,
        jaa: jaa,
        tyyppi: tyyppi,
        yhdistaTekstit: yhdistaTekstit,
        nayta: nayta,
        suorita: suorita,
        tama: tama,
        eiMitaan: new EiMitaan(),
        pituus: pituus,
        jos: jos,
        muutoin: muutoin,
        ehka: ehka,
        kysy: kysy,
        on: on,
        pari: pari,
        lista: lista,
        kokoelma: kokoelma,
        ja: ja,
        tai: tai,
        suurempi: suurempi,
        pienempi: pienempi,
        lueIndeksi: lueIndeksi,
        arvo: arvo,
        sitten: sitten,
        lopeta: lopeta,
        jatka: jatka,
        muokkaa: muokkaa,
        silmukka: silmukka,
        etsi: etsi,
        etsiIndeksi: etsiIndeksi
    };

    standardikirjasto = function(tyyppi, nimi) {
      if (tyyppi === 1) {
        return api[nimi];
      } else {
        var args = [];
        for (var i = 2, n = arguments.length; i < n; i++) {
          args.push(arguments[i]);
        }

        return api[nimi].apply(undefined, args);
      }
    };

    standardikirjasto.suorita = suorita;
    standardikirjasto.vrt = vertaaEhtoArvoja;

})();
