(ns standardikirjastoNatiivi)

(defn- testifunktio [a] ("haaa" ))

(defn standardikirjasto [funktioVaiArvo nimi & loput]
    (if (== funktioVaiArvo 0)
        (apply testifunktio loput)
        "hoo"))
    
(defn vrt [odotettuArvo, oikeaArvo]
    (if (clojure.test/function? odotettuArvo)
        (odotettuArvo oikeaArvo)
        (== odotettuArvo oikeaArvo)))