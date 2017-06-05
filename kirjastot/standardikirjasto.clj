(ns standardikirjastoNatiivi)

;; Util

(def not-nil? (complement nil?))

(defn- on [a b] (= a b))

;; Maybe

(defprotocol Ehka
  (_arvo_ [x]))

(deftype EiMitaan []
  Object
    (toString [x] "eiMitään")
  Ehka
    (_arvo_ [x] (throw (Exception. "Huono argumentti funktioon arvo. Argumentin 1 pitäisi olla tyyppiä tämä, mutta se oli eiMitään"))))
  
(deftype Tama [a]
  Object
    (toString [x] (str "tämä(" a ")"))
  Ehka
    (_arvo_ [x] a))

(defn- arvo [a] (_arvo_ a))

(defn- tama [a] (Tama. a))

(defn- numeroksi [n]
    (try
        (tama (Float/parseFloat n))
        (catch Exception e (EiMitaan.))))

;; Kokoelmatyypit Pari, Kokoelma ja Lista

(defprotocol Indeksoitava
    (lue-indeksi [x i]))

(deftype Pari [a b]
        Object
            (toString [p] (str (.a p) " : " (.b p)))
        Indeksoitava
            (lue-indeksi [x i]
                (case i
                    0 a
                    1 b
                    nil)))
        
(defn- pari [a b] (Pari. a b))

(deftype Kokoelma [parit]
        Object
          (toString [k]
            (str "kokoelma(" (clojure.string/join ", " (.parit k)) ")" ))
        Indeksoitava
          (lue-indeksi [x i]
            (let [osuma (first (filter #(= (.a %1) i) parit))]
              (if (nil? osuma) nil (.b osuma)))))

(defn- kokoelma [& parit] (Kokoelma. (into [] parit)))

(defn- muokkaa-kokoelmaa [kokoelma uusi-pari]
    (let [
          key (.a uusi-pari)
          data (.parit kokoelma)
          vanha (first (keep-indexed #(when (= (.a %2) key) %1) data))
          uusi-lista (if vanha (assoc data vanha uusi-pari) (conj data uusi-pari))
         ]
     (Kokoelma. uusi-lista)))
 
(deftype Lista [data syklinen]
        Object
          (toString [k]
            (str "lista(" (clojure.string/join ", " (.data k)) ")" ))
        Indeksoitava
          (lue-indeksi [x i]
            (let [
                  size (count data)
                  i_ (if (and syklinen (> i size) (not= size 0))
                         (mod size i) ; Jos lista on syklinen, otetaan (pituus % i) indeksi
                         i)
                 ]
                (nth data i_ nil))))
      
(defn- lista [& arvot]
    (Lista. (into [] arvot) false))

(defn- yhdistaListat [a b]
    (if (string? a)
        (do
            (assert (string? b) (str "Huono argumentti 1 funktioon ++, "
                                     "argumenttien pitäisi olla lista ja lista "
                                     "tai teksti ja teksti, mutta ne olivat"
                                     a b))
            (str a b))
        (concat a b)))

(defn- lisaaLoppuun [a l]
    (Lista. (conj (.data l) a) false))

(defn- etsiIndeksi [pred l]
    (or (first (keep-indexed #(when (pred %2) %1) (.data l))) -1))


(defn- silmukka [l]
    (Lista. (.data l) true))

(defn- lue-indeksi_ [a i]
    (let [tulos (lue-indeksi a i)]
         (assert (not-nil? tulos) (str "Indeksiä " i " ei löydy kokoelmasta " a))
         tulos))
     
(defn- lue-indeksi_varovasti [a i]
    (let [tulos (lue-indeksi a i)]
        (if (nil? tulos) (EiMitaan.) (tama a))))


; Komento-luokka kuvaa ohjelmasta palautettua pyyntöä
; suorittaa annettu tehtävä ja/tai muokata tilaa
(deftype Komento [tehtava tilan-muokkaus])


; Suorittaa annetun komennon tehtävän
(defn- tehtava [komento tila]
  ((.tehtava komento) tila))

; Muokkaa ohjelman tilaa komentoon liittyvällä muokkaajalla
(defn- tilan-muokkaus [komento komennon-tulos vanha-tila]
  (let [tm (.tilan-muokkaus komento)]
    (if (not-nil? tm) (tm komennon-tulos) vanha-tila)))

;;; Komentoja:

; Tulostaa annetun viestin
(defn- nayta [viesti] (Komento. (fn [_] (println (str viesti))) nil))

; Kysyy kysymyksen ja muokkaa tilaa
(defn- kysy [viesti tilan-muokkaus]
    (Komento.
        (fn [_]
            (print viesti)
            (flush)
            (read-line))
        tilan-muokkaus
    ))

(defn- sitten [a b_]
    (Komento.
        (fn [vanha-tila]
            (let [
                  tulos-a (tehtava a vanha-tila)
                  tila-a (tilan-muokkaus a tulos-a vanha-tila)
                  b (if (clojure.test/function? b_) (b_ tila-a) b_) ; B voi olla komento tai komennon palauttava funktio
                  tulos-b (tehtava b tila-a)
                  tila-b (tilan-muokkaus b tulos-b tila-a)
             ]
            ; Mahdollinen bugi:
            ; Toisin kuin JS-versiossa, tästä kohtaa on vaikea
            ; palauttaa tulos-b muuttujaa, sillä tarvitsemme
            ; tila-b muuttujaa Komento-konstruktorin toisessa argumentissa,
            ; eli tilan muokkausfunktiossa ja meidän on siksi palautettava
            ; tila-b eikä tulos-b. Katso JS-toteutus nähdäksesi eron paremmin.
            ; Tämä onneksi tuskin aiheuttaa ongelmia, sillä komennon tulosta
            ; ei pitäisi tarvita muuhun kuin tilan muokkausfunktioon joka
            ; tässä juuri määritellään.
            tila-b)
        )
        (fn [tila-b] tila-b)))
    
(defn- muokkaaTilaa [muokkaaja]
    (Komento. identity (fn [x]
        (muokkaaja x))))
                 

(defn suorita
    "Ö-ohjelman kasaava funktio, joka kutsuu ohjelmaa tilalla
    ja suorittaa mahdollisesti plaautetun tehtävän.
    Mikäli tehtävä muokkaa tilaa, suorittaa ohjelman uudestaan
    muokatulla tilalla."
    [ohjelma tila]
    (let [
        tulos (ohjelma tila)
        uusi-kierros (fn []
            (let [
                      uusi-tila (tilan-muokkaus tulos (tehtava tulos tila) tila)]
                (if (or
                        (identical? tulos :jatka)
                        (and 
                             (not (identical? tulos :lopeta))
                             (= tila uusi-tila)))
                    uusi-tila
                    (suorita ohjelma uusi-tila))))]
        
        (if (instance? Komento tulos) (uusi-kierros) nil)))

;; Julkiset funktiot listataan tässä jotta niihin päästään käsiksi
;; standardikirjastoista käsin.
(def api (hash-map
    "nayta" nayta
    "suorita" suorita
    "pari" pari
    "lista" lista
    "kokoelma" kokoelma
    "kysy" kysy
    "summaa" +
    "vahenna" -
    "kerro" *
    "jaa" /
    "pienempi" <
    "suurempi" >
    "muokkaa" muokkaa-kokoelmaa
    "lista" lista
    "arvo" arvo
    "tama" tama
    "eiMitaan" (EiMitaan.)
    "lueIndeksi" lue-indeksi_
    "lueIndeksiVarovasti" lue-indeksi_varovasti
    "numeroksi" numeroksi
    "sitten" sitten
    "lopeta" (Komento. (constantly :lopeta) nil)
    "jatka" (Komento. (constantly :jatka) nil)
    "muokkaaTilaa" muokkaaTilaa
    "silmukka" silmukka
    "yhdistaListat" yhdistaListat
    "lisaaLoppuun" lisaaLoppuun
    "etsiIndeksi" etsiIndeksi
    "on" on
))

(defn standardikirjasto [funktioVaiArvo nimi & args]
    (if (== funktioVaiArvo 0)
        (do
            (assert (clojure.test/function? (get api nimi)) (str "Funktiota " nimi " ei löydy standardikirjastosta"))
            (apply (get api nimi) (if (nil? args) (list) args)))
        (get api nimi)))
    
(defn vrt [odotettuArvo, oikeaArvo]
    (if (clojure.test/function? odotettuArvo)
        (odotettuArvo oikeaArvo)
        (= odotettuArvo oikeaArvo)))
    
