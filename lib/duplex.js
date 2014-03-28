module.exports = (function() {
  "use strict";
  
  var duplex,
      ctor,
      Duplex = require("stream").Duplex || require("readable-stream").Duplex,
      inherits = require("util").inherits,
      _ = require("lodash");
  
  ctor = function(options, readable, writable) {
    
    var Duplexer = function(opt) {
      if(!(this instanceof Duplexer)) {
        return new Duplexer(options);
      }
      Duplex.call(this, options);
      var buffer = [], self = this;
      this.options = _.extend(options, opt);
      this.rStream = readable;
      this.wStream = writable;
      this._buffer = buffer;
      this.drained = false;
      readable.on("readable", function() {
        // console.log("readable");
        var chunk;
        while((chunk = readable.read()) !== null) {
          // console.log("input", chunk.toString());
          buffer.push(chunk);
        }
      }).on("end", function() {
        self.push(null);
      });
      // setTimeout(function() {
      //   readable.pipe(self);
      // }, 0);
      // readable.resume();
      // readable.read(0);
      // console.log(readable.read());
    };
    
    inherits(Duplexer, Duplex);
    
    Duplexer.prototype._read = function(n) {
      console.log("read", n);
      var chunk;
      while(this._buffer.length) {
        chunk = this._buffer.shift();
        if(!this.push(chunk)) {
          break;
        }
      }
      if(this._buffer.length) {
        setTimeout(this._read.bind(this, n), 1000);
      }
    };
    
    Duplexer.prototype._write = function (chunk, enc, callback) {
      var write = this.rStream.write.bind(this.rStream, chunk, enc, callback);
      if(this.drained) {
        this.rStream.once("drain", write);
      } else {
        this.drained = write();
      }
      // console.log(this.drained);
    };
    
    return Duplexer;
  };
  
  duplex = function(readable, writable) {
    return ctor({}, readable, writable)();
  };
  
  return duplex;
  
}());