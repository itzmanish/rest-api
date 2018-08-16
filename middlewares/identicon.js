const { SHA512 } = require("crypto-js");
const Identicon = require("identicon.js");
let identiconGen = function(username) {
  let hash = SHA512(username + "bjdsoihufihasjfsdiufsd65f34").toString();
  // set up options
  //   var options = {
  //     foreground: [0, 0, 0, 255], // rgba black
  //     background: [255, 255, 255, 255], // rgba white
  //     margin: 0.2, // 20% margin
  //     size: 420, // 420px square
  //     format: "svg" // use SVG instead of PNG
  //   };

  // create a base64 encoded SVG
  var data = new Identicon(hash, 420).toString();

  // write to a data URI
  return data;
};

module.exports = identiconGen;
