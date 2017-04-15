
var tokenisoi = require('./tokenisointi.js').tokenisoi;
var tokentyypit = require('./tokenit.js');
var omit = require('lodash/fp/omit');
var map = require('lodash/fp/map');

const poistaSijainti = omit('sijainti');

test('tulkitsee yksinkertaisen numeron oikein', () => {
    const tulos = map(poistaSijainti, tokenisoi('3'));

    expect(tulos).toEqual([
      { tyyppi: tokentyypit.NUMERO, arvo: '3', indeksi: 0 } 
    ]);
});

test('tulkitsee desimaaliluvun oikein', () => {
   const tulos = tokenisoi('3.5');
   expect(tulos).toEqual([
        { tyyppi: tokentyypit.NUMERO, arvo: '3.5', indeksi: 0 }    
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
      { tyyppi: tokentyypit.SYMBOLI, arvo: 'testi', indeksi: 0 },
      { tyyppi: tokentyypit.RIVINVAIHTO, arvo: '\n'.repeat(3), indeksi: 5 },
      { tyyppi: tokentyypit.SYMBOLI, arvo: 'testi', indeksi: 8 }
   ]);
});