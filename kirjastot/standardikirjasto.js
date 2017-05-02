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
    
    function Komento(tehtava, tilanMuokkaus) {
        this._tehtava = tehtava;
        this._tilanMuokkaus = tilanMuokkaus;
    }
    
    Komento.prototype.tehtava = function() {
      try {
          var tulos = this._tehtava();
          return Promise.resolve(tulos);
      } catch (err) {
          console.log(err);
          return Promise.reject(err);
      }
    };
    
    Komento.prototype.tilanMuokkaus = function(vanhaTila, komennonTulos) {
        if (typeof this._tilanMuokkaus === 'function') { 
            try {
                return this._tilanMuokkaus(vanhaTila);
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
                if (argTyypit[i] !== tyyppi(args[i])) {
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
                    if (uusiTila) {
                        suorita(ohjelma, uusiTila);
                    }
                });
            }
        } catch (virhe) {
            console.log(virhe);
        }
    }
    
    standardikirjasto = {
        summaa: summaa,
        jaa: jaa,
        tyyppi: tyyppi,
        yhdistaTekstit: yhdistaTekstit,
        nayta: nayta,
        suorita: suorita
    };
    
})();

