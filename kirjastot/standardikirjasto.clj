(ns standardikirjastoNatiivi)

(defn nayta [viesti] (println viesti))

(def api (hash-map
    "nayta" nayta
))

(defn standardikirjasto [funktioVaiArvo nimi & args]
    (if (== funktioVaiArvo 0)
        (apply (get api nimi) (if (nil? args) (list) args))
        (get api nimi)))
    
(defn vrt [odotettuArvo, oikeaArvo]
    (if (clojure.test/function? odotettuArvo)
        (odotettuArvo oikeaArvo)
        (== odotettuArvo oikeaArvo)))
    
