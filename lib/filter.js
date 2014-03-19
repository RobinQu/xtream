module.exports = (function() {
  "use strict";
  
  var through = require("./through"), 
      ctor, filter;
  
  ctor = function(options, fn) {
    if("function" === typeof options) {
      fn = options;
      options = {};
    }
    var Filter = through.ctor(options, function(chunk, enc, cb) {
      if(this.options.stringify) {
        chunk = chunk.toString();
      }
      if(fn.call(this, chunk, this._index++)) {
        this.push(chunk);
      }
      return cb();
    });
    Filter.prototype._index = 0;
    return Filter;
  };
  
  filter = function(options, fn) {
    return ctor(options, fn)();
  };
  
  filter.ctor = ctor;
  
  return filter;
  
}());