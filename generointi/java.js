var P = require('../parserityypit.js');

module.exports = {
  
  [P.FUNKTIOLUONTI]: kavely => {
    const solmu = kavely.solmu;
    const parametrit = solmu.parametrit.ilmaisut.map(i => `Object ${i[0].arvo}`).join(', ');
    
    return (
`
public static Object ${solmu.arvo} (${parametrit}) {
    return null;
}
    
`);

  }
    
};