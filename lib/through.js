module.exports = (function() {
  "use strict";
  
  var Transform = require("stream").Transform || 
                  require("readable-stream/transform"),
      _ = require("lodash"),
      inherits = require("util").inherits,
      noop,
      normalize,
      through;

  noop = function(chunk, enc, callback) {
    callback(null, chunk);
  };

  normalize = function(method) {
    return function(options, transform, flush) {
      if("function" === typeof options) {
        flush = transform;
        transform = options;
        options = {};
      }
      if("function" !== typeof transform) {
        transform = noop;
      }
      if("function" !== typeof flush) {
        flush = null;
      }
      return method(options, transform, flush);
    };
  };

  through = normalize(function(options, transform, flush) {
    var t = new Transform(options);
    t._transform = transform;
    if(flush) {
      t._flush = flush;
    }
    return t;
  });

  through.ctor = normalize(function(options, transform, flush) {
    function Through(opts) {
      if(!(this instanceof Through)) {
        return new Through(opts);
      }
      this.options = _.extend(options, opts);
      Transform.call(this, this.options);
    }
    inherits(Through, Transform);
    Through.prototype._transform = transform;
    if(flush) {
      Through.prototype._flush = flush;
    }
    return Through;
  });

  through.obj = normalize(function(options, transform, flush) {
    var t = new Transform(_.extend({ objectMode: true }, options));
    t._transform = transform;
    if(flush) {
      t._flush = flush;
    }
    return t;
  });
    
  return through;
}());

