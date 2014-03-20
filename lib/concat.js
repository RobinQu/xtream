module.exports = (function() {
  "use strict";
  
  var WritableStream = require("stream").Writable || require("readable-stream").Writable,
      inherits = require("util").inherits,
      _ = require("lodash"),
      ConcatStream, 
      concat,
      Buffer = require("buffer").Buffer;
  
  ConcatStream = function(options, fn) {
    if(!(this instanceof ConcatStream)) {
      return new ConcatStream(options, fn);
    }
    if("function" === typeof options) {
      fn = options;
      options = {};
    }
    this.options = _.extend(options, {objectMode: true});
    WritableStream.call(this, options);
    this._buffer = [];
    this.on("finish", function() {
      fn(null, this.serialize());
    });
    this.on("error", fn);
  };
  
  inherits(ConcatStream, WritableStream);
  
  ConcatStream.prototype._write = function (chunk, enc, callback) {
    this._buffer.push(chunk);
    callback();
  };
  
  ConcatStream.prototype.inferType = function (sample) {
    sample = sample || this._buffer[0];
    if("string" === typeof sample) {
      return "string";
    }
    if(Buffer.isBuffer(sample)) {
      return "buffer";
    }
    if(/Array\]$/.test(Object.prototype.toString.call(sample))) {
      return "array";
    }
  };
  
  ConcatStream.prototype.transformers = {
    string: function() {
      return this._buffer.join("");
    },
    array: function() {
      return this._buffer.reduce(function(prev, cur) {
        return prev.concat(cur);
      }, []);
    },
    buffer: function() {
      return Buffer.concat(this._buffer.map(function(buf) {
        if(!Buffer.isBuffer(buf)) {
          return new Buffer(buf);
        }
        return buf;
      }));
    }
  };
  
  ConcatStream.prototype.serialize = function () {
    var type = this.inferType();
    return this.transformers[type].call(this);
  };
  
  concat = function(options, fn) {
    return new ConcatStream(options, fn);
  };
  
  concat.ctor = function() {
    return ConcatStream;
  };
  
  return concat;
  
}());