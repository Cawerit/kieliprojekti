
```
 /ÖÖ       /ÖÖ
|__/      |__/
   /ÖÖÖÖÖÖ               /ÖÖ        /ÖÖ             /ÖÖ  /ÖÖ
  /ÖÖ__  ÖÖ             | ÖÖ       |__/            | ÖÖ |__/
 | ÖÖ  | ÖÖ             | ÖÖ   /ÖÖ  /ÖÖ   /ÖÖÖÖÖÖ  | ÖÖ  /ÖÖ
 | ÖÖ  | ÖÖ   /ÖÖÖÖÖÖ   | ÖÖ  /ÖÖ/ | ÖÖ  /ÖÖ__  ÖÖ | ÖÖ | ÖÖ
 | ÖÖ  | ÖÖ  |______/   | ÖÖÖÖÖÖ/  | ÖÖ | ÖÖÖÖÖÖÖÖ | ÖÖ | ÖÖ
 | ÖÖ  | ÖÖ             | ÖÖ_  ÖÖ  | ÖÖ | ÖÖ_____/ | ÖÖ | ÖÖ
 |  ÖÖÖÖÖÖ/             | ÖÖ   ÖÖ  | ÖÖ |  ÖÖÖÖÖÖÖ | ÖÖ | ÖÖ
  \______/              |__/  __/  |__/  \_______/ |__/ |__/
                                                
```                                                

# Ohjelmointikieli Ö

## Yleistä

Ö on funktionaalinen, suomenkielinen ohjelmointikieli. Kielen tarkoituksena on olla helppokäyttöinen vaihtoehto funktionaalisiin ohjelmointikieliin tutustuvalle. Kielen voi kääntää JavaScriptille ja suorittaa suoraan Internet-selaimessa osoitteessa https://cawerit.github.io/kieliprojekti/. Sivustolla on myös erilaisia esimerkkejä kielen toiminnasta.

Ö:n pääparadigmoina toimivat funktionaalisuus ja helppokäyttöisyys. Funktionaalisten ohjelmointikielien tiettyjä ominaisuuksia (tyypitetty lambda-laskento, curry-muunnos, jne.) pidetään yleisesti vaikeina asioina oppia, joten näiden käyttäminen kielessä ollaan pyritty pitämään mahdollisimman yksinkertaisena. Ö on tyypitykseltään vahva ja dynaaminen, mikä tarkoittaa että se päättelee sille annettujen arvojen tyypit vasta suorituksen aikana, ja että arvot ovat vahvasti sidottuna niille asetettuun tyyppiin (toisin sanoen lausekkeet kuten 2 + “2” aiheuttavat suorituksenaikaisen virheen). 

Infiksifunktiot ovat olennainen osa Ö:tä ja niiden luomisesta ollaan tehty mahdollisimman yksinkertaista. Kaikki infiksifunktiot merkitään jollain erikoismerkillä, joten matemaattisiin laskutoimituksiin käytettävät symbolit (+, -, *, /, ^, %) toimivat jo luonnostaan infiksifunktioina. Käyttäjän luomat infiksifunktiot ovat samanarvoisia valmiiksi tehtyjen kanssa, ja käyttäjä voi ohjelmassaan korvata valmiiksi tehdyt funktiot kirjoittamalla ne uudelleen.Kaikki Ö-kielen funktiot ovat valmiiksi curry-muunnettuja.

## Kielioppi

### Standardikirjasto

Selitykset standardikirjaston funktioille ovat vielä kesken. Kaikki funktiot löytyvät kuitenkin listattuna alta.

tyyppi(a)

\+ (a, b);
presedenssi 10

\- (a, b);
presedenssi 10

\* (a, b);
presedenssi 11

/ (a, b);
presedenssi 11

++ (a, b);
presedenssi 10

% (a, b);
presedenssi 11

^ (a, b);
presedenssi 12

on: (a, b);
presedenssi 8

näytä(teksti)

muokkaaTilaa(muokkaaja)

pituus(jono)

jos(ehto, arvo)

muutoin: (ehkäArvo, taiSitten);
presedenssi 1

kysy(kysymys, tilanMuokkaus)

identiteetti(a)

pari(a, b)

: (a, b);
presedenssi 4

@ (kokoelma, indeksi);
presedenssi 20

@? (kokoelma, indeksi);
presedenssi 20

lista

lisääLoppuun(a, lista)

+loppuun (lista, a);
presedenssi 4

kokoelma 

&& (a, b);
presedenssi 6

|| (a, b);
presedenssi 5

\> (a, b);
presedenssi 8

< (a, b);
presedenssi 8

\>> (a, b);
presedenssi 1

|> (val, fn);
presedenssi 0

ehkä(fn, lista)

eiMitään

tämä(arvo)

sitten: (a, b);
presedenssi 4

| (kokoelma, pari);
presedenssi 3

arvo(a)

lopeta

jatka 

silmukka(lista)

etsi(ehto, lista)

etsiIndeksi(ehto, lista)

sisältää(alkio, lista) = etsiIndeksi((on:)(alkio), lista) > -1

ei(totuusarvo) = kun totuusarvo on Tosi niin Epätosi tai Tosi muutoin

numeroksi(a)

tekstiksi(a)

käsittele(fn, lista)

valikoi(fn, lista)

jokin(fn, lista)

kaikki(fn, lista)

takaperin(lista)

kokoa(fn, lista)

loppuosa(lista)

ota(n, lista)

pudota(n, lista)

listaksi(a)

liitä(lista)

eka = (@?)(1)

toka = (@?)(2)

argumentitYmpäri(fn) =
  käännetty(a, b) = fn(b, a)
  käännetty

debug
