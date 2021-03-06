var standardikirjasto; // Ö-kielen standardikirjasto

(function() {
    var tyypit = {
      LISTA: 'lista',
      KOKOELMA: 'kokoelma'
    };

    var T = function() { return true; };
    
    ////////////////////////////////////////////////////////////////////////////
    //
    // Yleiset funktiot
    //
    ////////////////////////////////////////////////////////////////////////////
    /**
     * Yhteenlasku numeroilla
     */
    var summaa  = fn('+', ['numero', 'numero'], function(a, b){ return a + b; });

    /**
     * Vähennyslasku numeroilla
     */
    var vahenna  = fn('-', ['numero', 'numero'], function(a, b){ return a - b; });
    
    /**
     * Kertolasku numeroilla
     */ 
    var kerro = fn('*', ['numero', 'numero'], function(a, b){ return a * b; });

    /**
     * Jakolasku numeroilla
     */
    var jaa = fn('/', ['numero', 'numero'], function(a, b){ return a / b; });
    /**
     * Yhdistää kaksi tekstiä toisiinsa
     */
    var yhdistaListat = fn('++', [T, T], function(a, b) {
      if (typeof a === 'string' && typeof b === 'string') {
        return a + b;
      } else if (a._tyyppi === tyypit.LISTA && b._tyyppi === tyypit.LISTA) {
        return uusiLista(a._data.concat(b._data));
      } else {
        argumenttiVirhe('++', 0, [a, b], 'lista ja lista tai teksti ja teksti');
      }
    });

    var lisaaLoppuun = fn('lisääLoppuun', [T, tyyppiOn('lista')], function(a, b) {
      var l = uusiLista(b._data.slice());
      l._data.push(a);
      return l;
    });
    
    var etsiIndeksi = fn('etsiIndeksi', ['funktio', tyyppiOn('lista')], function(fn, lista){
      var data = lista._data;
      for (var i = 0, n = data.length; i < n; i++) {
        if (fn(data[i])) {
          return i;
        }
      }
      
      return -1;
    });

    var compose = fn('>>', ['funktio', 'funktio'], function(a, b) {
      return function(x) {
        return b(a(x));
      };
    });

    var pipe = fn('|>', [T, 'funktio'], function(val, fn) {
      return fn(val);
    });

    function debug(a) {
      console.log(a);
      return debug;
    }
    
    var etsi = fn('etsi', ['funktio', tyyppiOn('lista')], function(fn, lista) {
      var tulos = etsiIndeksi(fn, lista);
      if (tulos === -1) return new EiMitaan();
      else return tama(tulos);
    });

    /**
    * Kahden arvon samanarvoisuutta testaava funktio
    */
    function on(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        
        var aTyyppi = a._tyyppi;
        if (aTyyppi !== b._tyyppi) return false;

        if (aTyyppi === tyypit.LISTA) {
          return lista_on(a, b);
        }

        if (aTyyppi === tyypit.KOKOELMA) {
          return kokoelma_on(a, b);
        }

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
        if (typeof jono === 'string') {
            return Array.from(jono).length;
        } else if (jono._tyyppi === tyypit.LISTA) {
          return jono._data.length;
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

    function numeroksi(a) {
      var num = parseFloat(a);
      if (num !== num) { // NaN
        return new EiMitaan();
      } else {
        return tama(num);
      }
    }

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
      switch (typeof a) {
        case 'boolean':
          return a ? 'Tosi' : 'Epätosi';
        case 'string':
          return a;
        default:
          return a === null ? 'JavaScriptNativeNull'
            : a === undefined ? 'JavaScriptNativeUndefined'
            : Array.isArray(a) ?
              a.map(tekstiksi).join(', ')
              : a.toString();
      }
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
      
      l._data = alkio == null ? [] : [alkio];
      l._tyyppi = tyypit.LISTA;
      l.toString = lista_toString;
      l._lueIndeksi = lista_lueIndeksi;
      l._syklinen = false;
      return l;
    }

    /* @private */
    function uusiLista(data) {
      var l = lista();
      l._data = data;
      return l;
    }

    // Listafunktioita

    function nativeJsListFn(nimi, listFn, palautusarvoOnLista) {
      return function(fn, lista) {
        if (lista._tyyppi !== tyypit.LISTA) {
          argumenttiVirhe(nimi, 1, lista, 'lista');
        }
        if (typeof fn !== 'function') {
          argumenttiVirhe(nimi, 0, fn, 'funktio');
        }

        var tulos = listFn.call(lista._data, function(a){ return fn(a); });
        
        if (palautusarvoOnLista) {
          return uusiLista(tulos);
        } else {
          return tulos;
        }
      }
    }

    function id(a) { return a; }

    var kasittele = nativeJsListFn('käsittele', Array.prototype.map, true);
    var valikoi = nativeJsListFn('valikoi', Array.prototype.filter, true);
    var jokin = nativeJsListFn('jokin', Array.prototype.some, id, false);
    var kaikki = nativeJsListFn('kaikki', Array.prototype.every, id, false);
    
    var kokoa = fn('kokoa', ['funktio', T, tyyppiOn('lista')], function(f, val, lista) {
      return lista._data.reduce(function(prev, next) {
        return f(prev)(next);
      }, val);
    });

    var ota = fn('ota', ['numero', tyyppiOn('lista')], function(n, lista) {
      return uusiLista(lista._data.slice(0, n));
    });

    var pudota = fn('pudota', ['numero', tyyppiOn('lista')], function(n, lista) {
      return uusiLista(lista._data.slice(n, lista._data.length));
    });

    var loppuosa = fn('loppuosa', [tyyppiOn('lista')], function(lista) {
      var len = lista._data.length;
      return len === 0 ? uusiLista([]) : uusiLista(lista._data.slice(1, len));
    });

    var takaperin = fn('takaperin', [tyyppiOn('lista')], function(lista) {
      return uusiLista(lista._data.reverse());
    });

    var listaksi = fn('listaksi', [T], function(arvo) {
      if (arvo._tyyppi === tyypit.LISTA) {
        return uusiLista(arvo);
      } else if(typeof arvo === 'string') {
        return uusiLista(Array.from(arvo));
      } else {
        argumenttiVirhe('listaksi', 0, arvo, 'lista tai teksti');
      }
    });

    var liita = fn('liita', [tyyppiOn('lista')], function liita(lista) {
      if (lista.length === 0) return uusiLista([]);

      var
        l = lista._data,
        r = l[0],
        tyyppi = typeof r;

      if (typeof r !== 'string' && r._tyyppi !== tyypit.LISTA) {
        argumenttiVirhe('liita', 0, lista, 'lista(teksti tai lista)');
      }

      for(var i = 1, n = l.length; i < n; i++) {
        if (tyyppi === 'string') {
          r += l[i];
        } else {
          r = uusiLista(r.concat(l[i]));
        }
      }

      return r;
    });

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

    /* Testaa kahden listan samanarvoisuutta */
    function lista_on(a, b) {
      var
        dataA = a._data,
        dataB = b._data;
      
      if (dataA.length !== dataB.length) return false;
      for (var i = 0, n = dataA.length; i < n; i++) {
        if (!on(dataA[i], dataB[i])) return false;
      }

      return true;
    }

    function kokoelma(pari) {
      var k = function(pari) {
        k._data.push(pari);
        return k;
      };
      k._data = pari ? [pari] : [];
      k._tyyppi = tyypit.KOKOELMA;
      k.toString = kokoelma_toString;
      k._lueIndeksi = kokoelma_lueIndeksi;
      return k;
    }

    function kokoelma_on(a, b) {
      // Tähän sopii listoille tarkoitettu tarkistus,
      // koska se vuorostaan kutsuu Pari.prototype.on funktiota
      // jokaiselle datan alkiolle
      return lista_on(a, b);
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

    function _lueIndeksi(listaTaiKokoelma, indeksi) {
      if (typeof listaTaiKokoelma._lueIndeksi === 'function') {
        return listaTaiKokoelma._lueIndeksi(indeksi);
      } else {
        argumenttiVirhe('@', 0, listaTaiKokoelma, 'lista, kokoelma tai pari');
      }
    }

    function onListaTaiKokoelma(a){
      return !!a && typeof a._lueIndeksi === 'function';
    }

    var lueIndeksi = fn('@', [onListaTaiKokoelma, T], function (listaTaiKokoelma, indeksi) {
      var r = _lueIndeksi(listaTaiKokoelma, indeksi);
      if (r == null) {
        throw new Error('Indeksiä ' + indeksi + ' ei löydy kokoelmasta ' + listaTaiKokoelma);
      }
      return r;
    });

    var lueIndeksiVarovasti = fn('@?', [onListaTaiKokoelma, T], function (listaTaiKokoelma, indeksi) {
      var r = _lueIndeksi(listaTaiKokoelma, indeksi);
      return r == null ? new EiMitaan() : tama(r);
    });

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
    
    var muokkaaTilaa = fn('muokkaaTilaa', ['funktio'], function (muokkaaja) {
      return new Komento(function(tila) { return tila; }, muokkaaja);
    });

    var sitten = fn('sitten:', [constr(Komento), T], function(a, b) {
      var tilaBJalkeen;
      
      return new Komento(function(vanhaTila) {
        return a.tehtava(vanhaTila)
          .then(function(tulos) {
            var uusiTila = a.tilanMuokkaus(tulos, vanhaTila);
            var bKomento = typeof b === 'function' ?
              b(uusiTila)
              : b;
            
            if (!constr(Komento)(bKomento))  {
              argumenttiVirhe('sitten:', 1, b, 'komento tai komennon palauttava funktio');
            }
            
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
                }, function(err) {
                  console.error(err);
                });
            }
        } catch (virhe) {
            console.log(virhe);
        }
    }

    var api = {
        summaa: summaa,
        vahenna: vahenna,
        kerro: kerro,
        jaa: jaa,
        tyyppi: tyyppi,
        yhdistaListat: yhdistaListat,
        nayta: nayta,
        muokkaaTilaa: muokkaaTilaa,
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
        lueIndeksiVarovasti: lueIndeksiVarovasti,
        arvo: arvo,
        sitten: sitten,
        lopeta: lopeta,
        jatka: jatka,
        muokkaa: muokkaa,
        silmukka: silmukka,
        etsi: etsi,
        etsiIndeksi: etsiIndeksi,
        numeroksi: numeroksi,
        kasittele: kasittele,
        valikoi: valikoi,
        jokin: jokin,
        kaikki: kaikki,
        kokoa: kokoa,
        ota: ota,
        pudota: pudota,
        loppuosa: loppuosa,
        takaperin: takaperin,
        listaksi: listaksi,
        liita: liita,
        lisaaLoppuun: lisaaLoppuun,
        debug: debug,
        tekstiksi: tekstiksi,
        compose: compose,
        pipe: pipe
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
