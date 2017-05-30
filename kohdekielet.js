const _ = require('lodash');

const tiedostoPaatteet = {
    javascript: 'js',
    clojure: 'clj'
};

const tuetutKielet = _.values(tiedostoPaatteet);
const tiedostoPaate = kieli => {
    return tiedostoPaatteet[kieli];
};

module.exports = {
  tiedostoPaate,
  tuetutKielet
};