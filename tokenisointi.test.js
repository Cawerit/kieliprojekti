
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

test('heittää virheen jos luvussa on kaksi pistettä', () => {
    const suoritus = () => tokenisoi('42.3.5');
    expect(suoritus).toThrow();
});

test('käsittelee peräkkäiset rivinvaihdot oikein', () => {
   const koodi =
`testi


testi`;

   expect(tokenisoi(koodi)).toEqual([
      { tyyppi: 'Symboli', arvo: 'testi' },
      { tyyppi: 'Rivinvaihto', arvo: '\n'.repeat(3) },
      { tyyppi: 'Symboli', arvo: 'testi' }
   ]);
});