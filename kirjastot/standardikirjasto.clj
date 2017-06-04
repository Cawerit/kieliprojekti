(ns standardikirjastoNatiivi)

;; Util

(def not-nil? (complement nil?))

(deftype Pari [a b]
         Object
            (toString [p] (str (.a p) " : " (.b p))))
        
(defn- pari [a b] (Pari. a b))

(deftype Kokoelma [parit]
         Object
          (toString [k]
            (str "kokoelma(" (clojure.string/join ", " (.parit k)) ")" )))

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
            (str "lista(" (clojure.string/join ", " (.data k)) ")" )))
      
(defn- lista [& arvot]
    (Lista. (into [] arvot)))

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
    "kysy" kysy
    "summaa" +
    "vahenna" -
    "kerro" *
    "jaa" /
    "pienempi" <
    "suurempi" >
    "muokkaa" muokkaa-kokoelma
    "lista" lista
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
    
