module.exports = (function() {
  "use strict";
  var through = require("./through"),
      ctor, map;
  
  ctor = function(options, fn) {
    if(typeof options === "function") {
      fn = options;
      options = {};
    }
    
    var Map = through.ctor(options, function(chunk, enc, cb) {
      if(this.options.stringify) {
        chunk = chunk.toString();
      }
      this.push(fn.call(this, chunk, this._index++));
      return cb();
    });
  
    Map.prototype._index = 0;
    
    return ctor;
  };
  
  map = function(options, fn) {
    return ctor(options, fn)();
  };
  
  map.ctor = ctor;
  
  return map;
}());