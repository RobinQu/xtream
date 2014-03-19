/*global setImmediate */

module.exports = (function() {
  "use strict";
  var through = require("./through"),
      StringDecoder = require("string_decoder"),
      _ = require("lodash"),
      ctor,
      split;
  
  ctor = function(options, map) {
    
    var Split;
        
    Split = through.ctor(_.extend({objectMode:true, decodeStrings:true}, options), function(chunk, enc, callback) {
      this._decoder = this._decoder || new StringDecoder(this.options.encoding);
      this._buffer = this._buffer || [];
      this._splits = this._splits || [];
      chunk = (this._buffer.pop()  || "") +  this._decoder.write(chunk);
      var spliter = this.options.spliter || /\r?\n/,
          pieces = chunk.split(spliter);
      this._buffer.push(pieces.pop());
      this._splits = this._splits.concat(pieces);
      this._push();
      callback();
    }, function(callback) {
      var chunk = this._buffer.join("") + this._decoder.end(),
          spliter = this.options.spliter || /\r?\n/,
          pieces = chunk.split(spliter);
      this._splits = this._splits.concat(pieces);
      this._buffer = [];
      this._finish(callback);
    });
    
    Split.prototype.map = map;
    
    Split.prototype._push = function() {
      var i, len, line;
      for(i=0,len=this._splits.length; i<len; i++) {
        line = this._splits.shift();
        line = this.map ? this.map(line) : line;
        if(!this.push(line)) {
          break;
        }
      }
    };
    
    Split.prototype._finsih = function(callback) {
      var self = this;
      this._push();
      if(this._splits.length > 0) {
        setImmediate(function() {
          self._finish();
        });
      } else {
        this.push(null);
        callback(null);
      }
    };
    
    return Split;
  };
  
  split = function(options, map) {
    return ctor(options, map)();
  };
  
  split.ctor = ctor;
  
  return split;
}());