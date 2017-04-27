var standardikirjasto;

(function() {
    
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
        this.tehtava = tehtava;
        this.tilanMuokkaus = tilanMuokkaus;
    }
    
    var nayta = fn('nayta', ['Teksti', 'Funktio'], (tehtava, tilanMuokkaus) => new Komento(tehtava, tilanMuokkaus));
    
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
        throw new Error(`Huono argumentti funktioon ${nimi}. Argumentin ${indeksi} pitäisi olla ${tyyppi}, mutta se oli ${argumentti}`);    
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
    
    standardikirjasto = {
        summaa: summaa,
        jaa: jaa,
        tyyppi: tyyppi,
        yhdistaTekstit: yhdistaTekstit,
        nayta: nayta
    };
    
})();

