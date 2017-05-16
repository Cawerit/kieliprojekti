var standardikirjasto;

(function() {
    function noop() {};
    
    /**
     * Yhteenlasku numeroilla
     */
     
    var summaa = fn('+', ['Numero', 'Numero'], function(a, b){ return a + b; }); 
    /**
     * Jakolasku numeroilla
     */
    var jaa = fn('/', ['Numero', 'Numero'], function(a, b){ return a / b; });
    
    /**
     * Yhdistää kaksi tekstiä toisiinsa
     */
    var yhdistaTekstit = fn('++', ['Teksti', 'Teksti'], function(a, b) { return a + b; });
    
    function Ehka () {}
    function Tama (arvo) { Ehka.call(this); this.arvo = arvo; }
    function EiMitaan () { Ehka.call(this); }
    
    Tama.prototype = Object.create(Ehka.prototype);
    EiMitaan.prototype = Object.create(Ehka.prototype);
    
    Tama.prototype.toString = function() {
        return 'tämä(' + this.arvo + ')';
    };
    
    EiMitaan.prototype.toString = function() {
        return 'eiMitaan';
    };
    
    Tama.prototype._on = function(b) {
        return !!b && b instanceof Tama && on(b.arvo, this.arvo);
    };
    
    EiMitaan.prototype._on = function(b) {
        return b === this || (!!b && b instanceof EiMitaan);
    };
    
    Tama.prototype.constructor = Tama;
    EiMitaan.prototype.constructor = EiMitaan;
    
    function on(a, b) {
        if (a === b) {
            return true;
        }
        if (a == null || b == null) {
            return false;    
        }
        if (typeof a === 'object' && typeof b === 'object') {
            if (a.constructor !== b.constructor) return false;
            var proto = Object.getPrototypeOf(a);
            if (typeof proto._on === 'function') {
                return proto._on.call(a, b);
            }
            var keysA = Object.keys(a);
            var keysB = Object.keys(b);
            if (keysA.length !== keysB.length) {
                return false;
            }
            for(var i = 0, n = keysA.length; i < n; i++) {
                var key = keysA[i];
                if(!on(a[key], b[key])) {
                    return false;
                }
            }
            
            return true;
        }
        
        return false;
    } 
    
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
    
    function pituus (jono) {
        if (typeof jono === 'string' || Array.isArray(jono)) {
            return Array.from(jono).length;
        } else {
            argumenttiVirhe('pituus', 0, jono, 'Teksti tai Lista');
        }
    }
    
    var jos = fn('jos', ['Totuusarvo', '*'], function(ehto, arvo) {
        if(ehto) {
            return new Tama(arvo);
        } else {
            return new EiMitaan();
        }
    });
    
    function muutoin(ehkaArvo, taiSitten) {
        if (!ehkaArvo || !(ehkaArvo instanceof Ehka)) {
            argumenttiVirhe('muutoin:', 0, ehkaArvo, 'tämä(arvo) tai eiMitään');
        } else if (taiSitten === undefined) {
            argumenttiVirhe('muutoin:', 1, taiSitten, 'jotakin');
        } else {
            
            return ehkaArvo instanceof Tama ? ehkaArvo.arvo : taiSitten;
            
        }
    }
    
    function Komento(tehtava, tilanMuokkaus) {
        this._tehtava = tehtava;
        this._tilanMuokkaus = tilanMuokkaus;
    }
    
    Komento.prototype.tehtava = function() {
      try {
          var tulos = this._tehtava();
          return Promise.resolve(tulos);
      } catch (err) {
          return Promise.reject(err);
      }
    };
    
    Komento.prototype.tilanMuokkaus = function(vanhaTila, komennonTulos) {
        if (typeof this._tilanMuokkaus === 'function') { 
            try {
                return this._tilanMuokkaus(komennonTulos);
            } catch (err) {
                console.log(err);
            }
        }
    };
    
    var nayta = fn('nayta', ['Teksti'], function(viesti) {
        return new Komento(function() { console.log(viesti); }, undefined);    
    });
    
    function tyyppi(a) {
        switch(typeof a) {
            case 'number': return 'Numero';
            case 'string': return 'Teksti';
            case 'object': return 'Objekti';
            case 'function': return 'Funktio';
            case 'boolean': return 'Totuusarvo';
        }
    }
    
    function argumenttiVirhe(nimi, indeksi, argumentti, tyyppi) {
        throw new Error(`Huono argumentti funktioon ${nimi}. Argumentin ${indeksi + 1} pitäisi olla ${tyyppi}, mutta se oli ${argumentti}`);    
    }
    
    function fn(nimi, argTyypit, f) {
        return function() {
            var args = Array.prototype.slice.call(arguments);
            for(var i = 0, n = args.length; i < n; i++) {
                if (argTyypit[i] !== '*' && argTyypit[i] !== tyyppi(args[i])) {
                    argumenttiVirhe(nimi, i, args[i], argTyypit[i]);
                }
            }
            return f.apply(this, args);
        }
    }
    
    function suorita(ohjelma, tila) {
        try {
            var tulos = ohjelma(tila);
            if (tulos && tulos instanceof Komento) {
                var tehtavanTulos = tulos.tehtava();
                tehtavanTulos.then(function(t) {
                    var uusiTila = tulos.tilanMuokkaus(tila, t);
                    if (uusiTila !== undefined) {
                        suorita(ohjelma, uusiTila);
                    }
                });
            }
        } catch (virhe) {
            console.log(virhe);
        }
    }
    
    var api = {
        summaa: summaa,
        jaa: jaa,
        tyyppi: tyyppi,
        yhdistaTekstit: yhdistaTekstit,
        nayta: nayta,
        suorita: suorita,
        tama: function(a) { return new Tama(a); },
        eiMitaan: new EiMitaan(),
        pituus: pituus,
        jos: jos,
        muutoin: muutoin,
        kysy: kysy,
        on: on
    };
    
    standardikirjasto = function(funktio, argumenit) {
        var tulos, i, n;
        if (funktio === standardikirjasto) {
            var nimi = argumenit[1];
            
            if (argumenit[0] === 0) {
                var args = [];
                for (i = 2, n = argumenit.length; i < n; i++) {
                    args.push(argumenit[i]);
                }
                
                return api[nimi].apply(null, args);
            } else {
                return api[nimi];
            }
        } else {
            if (argumenit.length > 0) {
                tulos = funktio;
                for(i = 0, n = argumenit.length; i < n; i++) {
                    tulos = tulos(argumenit[i]);
                }
                return tulos;
            } else {
                return funktio();
            }
        }
    };
    
})();

