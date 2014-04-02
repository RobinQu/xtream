/*global setImmediate */

module.exports = (function() {
  "use strict";
  var through = require("./through"),
      StringDecoder = require("string_decoder").StringDecoder,
      _ = require("lodash"),
      debug = require("debug")("xtream:split"),
      ctor,
      split;
  
  ctor = function() {
    var Split,
        spliter,
        args = Array.prototype.slice.call(arguments),
        map,
        options;

    args.forEach(function(arg) {
      if(!arg) {return;}
      if("function" === typeof arg) {
        map = arg;
      } else if(arg.constructor === RegExp) {
        spliter = arg;
      } else {
        options = arg;
      }
    });
    spliter = spliter || /\r?\n/;
    options = options || {};

    Split = through.ctor(_.extend({objectMode:true, decodeStrings:true}, options), function(chunk, enc, callback) {
      this._decoder = this._decoder || new StringDecoder(this.options.encoding);
      this._buffer = this._buffer || "";
      this._splits = this._splits || [];
      chunk = (this._buffer || "") +  this._decoder.write(chunk);
      var pieces = chunk.split(spliter);
      debug("transform chunk; got %s pieces", pieces.length);
      this._buffer = pieces.pop();
      if(this._buffer.length > this.options.maxLength) {
        this.emit("error", new Error("max buffer size reached"));
        this._splits.length = 0;
        this._finish(callback);
        return;
      }
      this._splits = this._splits.concat(pieces);
      this._push();
      callback();
    }, function(callback) {
      var chunk = this._buffer + this._decoder.end(),
          pieces = chunk.split(spliter);
      debug("end chunk; got %s pieces", pieces.length);
      this._splits = this._splits.concat(pieces);
      // console.log(this._splits);
      this._finish(callback);
      this._buffer = "";
    });
    
    Split.prototype.map = map;
    
    Split.prototype._push = function() {
      var i, len, line;
      for(i=0,len=this._splits.length; i<len; i++) {
        line = this._splits.shift();
        try {
            line = this.map ? this.map(line) : line;
            // debug("push line %s", line);
        } catch(e) {
          debug("map error %s", e);
          this.emit("error", e);
        }
        
        if(!this.push(line)) {
          break;
        }
      }
    };
    
    Split.prototype._finish = function(callback) {
      var self = this;
      this._push();
      if(this._splits.length > 0) {
        setImmediate(function() {
          self._finish();
        });
      } else {
        this.push(null);
        callback();
      }
    };
    
    return Split;
  };
  
  split = function(options, spliter, map) {
    return ctor(options, spliter, map)();
  };
  
  split.ctor = ctor;
  
  return split;
}());