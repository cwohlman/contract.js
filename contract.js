var contracts = {};
var i = 0;
function Contract(name, test, implementation) {
  if (! name) name = "" + i++ + "()";
  if (typeof(name) !== "string") {
    throw new Error("Contract(name, test, implementation) expects name to be a string");
  }
  if (typeof(test) !== "function") {
    throw new Error("Contract(name, test, implementation) expects test to be a function");
  }
  if (typeof(implementation) !== "function") {
    throw new Error("Contract(name, test, implementation) expects implementation to be a function");
  }
  if (contracts[name]) {
    throw new Error("Contract(name, test, implementation) expects name to be unique, try Contract.extend(name, test, implementation)");
  }

  contracts[name] = {
    name: name,
    tests: [test],
    assertions: [],
    implementation: implementation
  };

  return contracts[name];
};

Contract.extend = function (name, test, implementation) {
  if (typeof(name) !== "string") {
    throw new Error("Contract.extend(name, test, implementation) expects name to be a string");
  }

  var contract = contracts[name];
  if (contract) {
    // slice@1.1 => slice@1.1.1
    // name = name.replace(/(\@)*(\d+\.*)*$/, "@$2." + i++);

    // slice@1 => slice@3
    name = name.replace(/@*\d*$/, '@' + i++);
  } else {
    if (! test || ! implementation) {
      throw new Error("Contract.extend(name, test, implementation) couldn't find existing contract to extend, please supply a test & implementation.")
    }
  }

  var result = Contract(name, test || contract.test, implementation || contract.implementation);

  if (test) {
    result.tests = result.tests.concat(contract.tests);
  }

  return result;
};

// This is where the magic happens.
// We first resolve the requested function, either in our cache, or by
// requiring the file we need.
// Then we test it, if a test was supplied.
Contract.require = function (name, test, source) {
  var contract = contracts[name];
  if (! contract) {
    var implementation;
    if (typeof(source) === "function") {
      implementation = source();
    } else if (typeof(source) === "string") {
      implementation = require(source);
    } else {
      throw new Error("Contract.require(name, test, source) expected source to be a string or a function.");
    }

    if (typeof(implementation) !== "function") {
      throw new Error("Contract.require(name, test, source) expected resolved source to be a function. Please pass the name of a module or a function which returns a function.");
    }

    contract = Contract(name, test, implementation);

    if (Contract.strict === true) {
      Contract.test(contract);
    }
  }

  // XXX wrap implementation in a function which executes guards/assertions.
  return contract.implementation;
};

Contract.test = function (contract) {
  if (typeof(contract) !== "object") {
    throw new Error("Contract.test(contract) expected contract to be an object.");
  }
  if (! (contract.tests instanceof Array)) {
    throw new Error("Contract.test(contract) expected contract.tests to be an array.");
  }
  if (typeof(contract.implementation) !== "function") {
    throw new Error("Contract.test(contract) expected contract.implementation to be a function.");
  }
  for (var i = 0; i < contract.tests.length; i++) {
    var test = contract.tests[i];
    if (typeof(test) !== "function") {
      throw new Error("Contract.test(contract) expected contract.tests[" + i + "] to be a function.");
    }

    var result = test(contract.implementation);

    if (result !== true) {
      throw new Error("Contract.test(contract) expected contract.tests[" + i + "](implementation) to return true, false, or throw an error.")
    }
  }

  return true;
};

Contract.strict = true;

module.exports = Contract;
