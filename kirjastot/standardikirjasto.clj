(ns standardikirjastoNatiivi)

;; Util

(def not-nil? (complement nil?))

(defprotocol Indeksoitava
    (lue-indeksi [x i]))

;; Maybe

(defprotocol Ehka
  (_arvo_ [x]))

(deftype EiMitaan []
  Ehka
    (_arvo_ [x] (throw (Exception. "Huono argumentti funktioon arvo. Argumentin 1 pitäisi olla tyyppiä tämä, mutta se oli eiMitään"))))
  
(deftype Tama [a]
  Ehka
    (_arvo_ [x] a))

(defn- arvo [a] _arvo_ a)

(defn- tama [a] (Tama. a))

(defn- numeroksi [n]
    (try
        (tama (Float/parseFloat n))
        (catch Exception e (EiMitaan.))))

;; Kokoelmatyypit Pari, Kokoelma ja Lista

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
          vanha (first (keep-indexed #(when (= (.a %2) %1)) (.parit kokoelma)))
          uusi-lista (if vanha (assoc vanha uusi-pari) (conj vanha uusi-pari))
         ]
     (Kokoelma. uusi-lista)))

(deftype Lista [data]
        Object
          (toString [k]
            (str "lista(" (clojure.string/join ", " (.data k)) ")" ))
        Indeksoitava
          (lue-indeksi [x i]
            (nth data i nil)))
      
(defn- lista [& arvot]
    (Lista. (into [] arvot)))


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
            (if (= tila uusi-tila) uusi-tila (suorita ohjelma uusi-tila))))]
        
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
    
