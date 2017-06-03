(ns standardikirjastoNatiivi)

(def not-nil? (complement nil?))

; Komento-luokka kuvaa ohjelmasta palautettua pyyntöä
; suorittaa annettu tehtävä ja/tai muokata tilaa
(deftype Komento [tehtava tilan-muokkaus])

; Suorittaa annetun komennon tehtävän
(defn tehtava [komento tila]
  ((.tehtava komento) tila))

; Muokkaa ohjelman tilaa komentoon liittyvällä muokkaajalla
(defn tilan-muokkaus [komento komennon-tulos vanha-tila]
  (def tm (.tilan-muokkaus komento))
  (if (not-nil? tm) (tm komennon-tulos) vanha-tila))

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
                  uusi-tila (tilan-muokkaus tulos (tehtava tulos tila) tila)])
            (if (= tila uusi-tila) uusi-tila (suorita ohjelma uusi-tila)))]
        
        (if (instance? Komento tulos) (uusi-kierros) nil)))

(defn nayta [viesti] (Komento. (fn [_] (println viesti)) nil))

;; Julkiset funktiot listataan tässä jotta niihin päästään käsiksi
;; standardikirjastoista käsin.
(def api (hash-map
    "nayta" nayta
    "suorita" suorita
))

(defn standardikirjasto [funktioVaiArvo nimi & args]
    (if (== funktioVaiArvo 0)
        (apply (get api nimi) (if (nil? args) (list) args))
        (get api nimi)))
    
(defn vrt [odotettuArvo, oikeaArvo]
    (if (clojure.test/function? odotettuArvo)
        (odotettuArvo oikeaArvo)
        (= odotettuArvo oikeaArvo)))
    
