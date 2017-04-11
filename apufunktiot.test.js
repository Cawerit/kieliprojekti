var apufunktiot = require('./apufunktiot.js');

describe('onErikoismerkki funktio', () => {
   
   test('palauttaa false kun sanassa ei ole erikoismerkkejä', () => {
        const tulos = apufunktiot.sisaltaaErikoismerkkeja('foobarÄöääööö');
        expect(tulos).toBe(false);
    });
    
    test('palauuttaa true kun sanassa on -', () => {
        const tulos = apufunktiot.sisaltaaErikoismerkkeja('foobarÄöääööö -');
        expect(tulos).toBe(true);
    });
    
});

