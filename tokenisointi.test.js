
var tokenisoi = require('./tokenisointi.js').tokenisoi;

test('tulkitsee yksinkertaisen numeron oikein', () => {
    const tulos = tokenisoi('3');
    expect(tulos).toEqual([
      { tyyppi: 'Numero', arvo: '3' } 
    ]);
});

test('tulkitsee desimaaliluvun oikein', () => {
   const tulos = tokenisoi('3.5');
   expect(tulos).toEqual([
        { tyyppi: 'Numero', arvo: '3.5' }    
   ]);
});

test('heittää virheen jos tekstinpätkää ei ole lopetettu', () => {
   const suoritus = () => tokenisoi(' "fail ');
   expect(suoritus).toThrow();
});