const
    base32 = require('base32'),
    _ = require('lodash');

const
    // RegEx muuttujanimille jotka alkavat ei-sallitulla merkillä
    // "m_" prefiksi on kielletty koska sitä käytetään base32-enkoodattujen
    // muuttujien aloituksessa.
    huonoAloitus            = /^(m_|[0-9])/,
    hyvaksytytMerkit        = /^[a-zA-Z0-9_]+$/,
    // Näitä nimiä vastaavat muuttujanimet voidaan helposti vaihtaa
    // hieman base32-enkoodausta siistinpään muotoon
    yleisetOperaattorit     = {
        op:     ['+',       '-',        '*',        '/',    '^'],
        nimi:   ['plus',    'miinus',   'kerro',    'jaa',  'potenssiin']
    },
    viimeinenKaksoispiste   = /:$/;

/**
 * Sanat jotka on varattu kohdekielille tai Ö:n standardikirjastolle.
 */
const varattu = [
  'abstract', 'arguments', 'await*', 'boolean', 'break', 'byte', 'case', 'catch',
  'char', 'class*', 'const', 'continue', 'debugger', 'default', 'delete', 'do',
  'double', 'else', 'enum*', 'eval', 'export', 'extends*', 'false', 'final',
  'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import',
  'in', 'instanceof', 'int', 'interface', 'let*', 'long', 'native', 'new',
  'null', 'package', 'private', 'protected', 'public', 'return', 'short',
  'static', 'super*', 'switch', 'synchronized', 'this', 'throw', 'throws',
  'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while',
  'with', 'yield', 'abstract', 'boolean', 'byte', 'char', 'double', 'final',
  'float', 'goto', 'int', 'long', 'native', 'short', 'synchronized', 'throws',
  'transient', 'volatile', 'Array', 'Date', 'eval', 'function',
  'hasOwnProperty', 'Infinity', 'isFinite', 'isNaN', 'isPrototypeOf',
  'length', 'Math', 'NaN', 'name', 'Number', 'Object', 'prototype', 'String',
  'toString', 'undefined', 'valueOf', 'getClass', 'window',
  'standardikirjasto', 'module', 'exports', 'require', '_'
 ];

// Ö-kieli tukee muuttujanimissä symboleita ja avainsanoja joita kohdekielet
// eivät tue. Tämä funktio muuttaa muuttujanimen hyväksyttävään muotoon
// mahdollisimman pienellä muutoksella, tarvittaessa kuitenkin tukeutuen
// base32-enkoodaukseen jolla koko sanasta tehdään epäselvä mutta
// mutta turvallinen sana.
const muuttujanimiGeneraattori = (ohita = []) => nimi => {
    if (hyvaksytytMerkit.test(nimi)) {
        const eiSallittu =
            huonoAloitus.test(nimi)
            || yleisetOperaattorit.nimi.indexOf(nimi) !== -1
            || (ohita.indexOf(nimi) === -1 && varattu.indexOf(nimi) !== -1);
            
        if (eiSallittu) {
            return '$' + nimi;
        } else {
            return nimi;
        }
    } else {
        // Koitetaan korvata yleiset operaattorinimet selväkielisillä
        // vastineilla ja välttää siten base32-enkoodaus
        const opIdx = yleisetOperaattorit.op.indexOf(nimi);
        if (opIdx !== -1) {
            return yleisetOperaattorit.nimi[opIdx];
        }
        // Ö-kielessä melko yleinen tapa on antaa muuttujille nimi joka loppuu
        // kaksoispisteeseen, joten koitetaan vielä välttää nimen sotkeminen
        // base32-enkoodauksella jos : voidaan vaihtaa dollarimerkkiin
        const korvattuKaksoispiste = nimi.replace(viimeinenKaksoispiste, '');
        if (hyvaksytytMerkit.test(korvattuKaksoispiste)) {
            return muuttujanimiGeneraattori(ohita)(korvattuKaksoispiste) + '$';
        }
        
        // Paremmat muunnokset eivät riittäneet, base32-endkoodataan
        // muuttuja jotta se on varmasti "turvallinen"
        return 'm_' + base32.encode(nimi) + `/*${nimi.replace(/\*\//g, '* /')}*/`;
    }
};

module.exports = { muuttujanimiGeneraattori };