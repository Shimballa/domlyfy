/*jshint node: true*/

var through = require("through");
var xtend = require("xtend");

//var defaultPrecompiler = require("handlebars");
var defaultPrecompiler = require("domly");
var defaultExtensions = {
  dly: true
};


// Convert string or array of extensions to an object
function toExtensionsOb(arr) {
  var ob = {};

  if (typeof arr === "string") {
    arr = arr.split(",");
  }

  if (Array.isArray(arr)) {
    arr.filter(Boolean).forEach(function(ext) {
      ob[ext] = true;
    });
  } else {
    // Already in the correct format
    return arr;
  }

  return ob;
}

function domlyfy(file, opts) {
  var extensions = defaultExtensions;
  var precompiler = defaultPrecompiler;

  if (!extensions[file.split(".").pop()]) return through();

  var buffer = "";

  return through(function(chunk) {
    buffer += chunk.toString();
  },
  function() {
    var js;
    try {
      js = precompiler.precompile(buffer, opts && opts.precompilerOptions);
    } catch (e) {
      this.emit('error', e);
      return this.queue(null);
    }
    // Compile only with the runtime dependency.
    var compiled = "// domlyfy compiled DOMly template\n";
    compiled += "module.exports = " + js.toString() + ";\n";
    this.queue(compiled);
    this.queue(null);
  });
}

// Return new domlyfy transform with custom default options
domlyfy.configure = function(rootOpts) {
  return function(file, opts) {
    return domlyfy(file, xtend({}, rootOpts, opts));
  };
};

module.exports = domlyfy;

