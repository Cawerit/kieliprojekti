var standardikirjasto;

(function() {
    
    var summaa = fn('+', ['Numero', 'Numero'], function(a, b){ return a + b; }); 
    var jaa = fn('/', ['Numero', 'Numero'], function(a, b){ return a / b; });
    
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
                if (argTyypit[i] !== typeof args[i]) {
                    argumenttiVirhe(nimi, i, args[i], argTyypit[i]);
                }
            }
            return f.apply(this, args);
        }
    }
    
    standardikirjasto = {
        summaa: summaa,
        jaa: jaa,
        tyyppi: tyyppi
    };
    
})();

