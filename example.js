var contract = require('./contract.js').require;
var leftpad = contract('leftpad', (fn) => {
  var result = fn("A", 2, " ");
  if (result !== " A") {
    throw new Error("Expected ' A' got '" + result + "' instead.")
  }
  return true;
}, "leftpad");

console.log(leftpad("$ 50.00", 20, " "));
