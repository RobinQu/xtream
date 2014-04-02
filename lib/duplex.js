/*global setImmediate */

module.exports = (function() {
  "use strict";
  
  var duplex,
      ctor,
      Duplex =  require("stream").Duplex || require("readable-stream").Duplex,
      inherits = require("util").inherits,
      _ = require("lodash"),
      debug = require("debug")("xtream:duplex");
  
  ctor = function(options, readable, writable) {
    
    var Duplexer = function(opt) {
      if(!(this instanceof Duplexer)) {
        return new Duplexer(options);
      }
      if(options.pipe || options.write) {//stream like objects
        writable = readable;
        readable = options;
        options = {};
      }
      var self = this;
      Duplex.call(this, options);
      this.options = _.extend(options, opt);
      this.rStream = readable;
      this.wStream = writable;
      // this._buffer = buffer;
      this.drained = false;
      readable.on("end", function() {
        self.push(null);
      });

      
      this.on("finish", function() {
        writable.end();
      });
      
    };
    
    inherits(Duplexer, Duplex);
    
    Duplexer.prototype._read = function(n) {
      debug("read %s", n);

      var readable = this.rStream,
          self = this;
      readable.once("readable", function() {
        debug("readable");
        var chunk;
        while((chunk = readable.read()) !== null) {
          debug("push buffer %s", chunk);
          self.push(chunk);
        }
      });
    };
    
    Duplexer.prototype._write = function(chunk, enc, callback) {
      var _callback = function() {
        debug("write callback");
        callback.apply(arguments);
      };
      var write = this.wStream.write.bind(this.wStream, chunk, enc, _callback),
      self = this;
      debug("write");
      if(this.drained) {
        this.wStream.once("drain", function() {
          debug("drain");
          self.drained = write();
        });
      } else {
        this.drained = !write();
        debug("write full?", this.drained);
      }
    };
    
    return Duplexer;
  };
  
  duplex = function(options, readable, writable) {
    return ctor(options, readable, writable)();
  };
  
  duplex.ctor = ctor;
  
  return duplex;
  
}());