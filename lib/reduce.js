module.exports = (function() {
  "use strict";
  var through = require("./through"),
      ctor, reduce;
  
  ctor = function(options, fn, initial) {
    if("function" === typeof options) {
      initial = fn;
      fn = options;
      options = {};
    }
    
    var Reduce = through.ctor(options, function(chunk, enc, cb) {
      if(this.options.stringify) {
        chunk = chunk.toString();
      }
      if((this._reduction === null || this._reduction === undefined)  && this._index === 0) {
        this._reduction = chunk;
        return cb();
      }
      this._reduction = fn.call(this, this._reduction, chunk, this._index++);
      return cb();
    }, function(cb) {
      this.push(this._reduction);
      cb();
    });
    
    Reduce.prototype._index = 0;
    Reduce.prototype._reduction = initial;
    
    return Reduce;
  };
  
  reduce = function(options, fn, initial) {
    return ctor(options, fn, initial)();
  };
  
  reduce.ctor = ctor;
  
  return reduce;
  
}());