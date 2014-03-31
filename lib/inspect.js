module.exports = (function() {
  "use strict";
  
  var through = require("./through"),
      ctor,
      inspect;
  
  ctor = function(options, fn) {
    if("function" === typeof options) {
      fn = options;
      options = {};
    }
    return through.ctor(options, function(chunk, enc, cb) {
      if(this.options.stringify) {
        chunk = chunk.toString();
      }
      var e = fn.call(this, chunk, enc);
      if(e instanceof Error) {
        return cb(e);
      }
      this.push(chunk);
      return cb(null);
    });
  };
  
  inspect = function(options, fn) {
    return ctor(options, fn)();
  };
  
  inspect.ctor = ctor;
  
  return inspect;
  
}());