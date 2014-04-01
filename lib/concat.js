module.exports = (function() {
  "use strict";
  
  var WritableStream = require("stream").Writable || require("readable-stream").Writable,
      inherits = require("util").inherits,
      _ = require("lodash"),
      ConcatStream, 
      concat,
      Buffer = require("buffer").Buffer,
      debug = require("debug")("xtream:concat");
  
  ConcatStream = function(options, fn) {
    if(!(this instanceof ConcatStream)) {
      return new ConcatStream(options, fn);
    }
    if("function" === typeof options) {
      fn = options;
      options = {};
    }
    var self = this;
    this.options = _.extend(options, {objectMode: true});
    WritableStream.call(this, options);
    this._buffer = [];
    this.on("finish", function() {
      fn(null, self.serialize());
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
    debug("test %s", sample);
    if("string" === typeof sample) {
      return "string";
    }
    if(Buffer.isBuffer(sample)) {
      return "buffer";
    }
    if(/Array\]$/.test(Object.prototype.toString.call(sample))) {
      return "array";
    }
    if(Object.prototype.toString.call(sample) === "[object Object]") {
      return "objects";
    }
    if("number" === typeof sample) {
      return "objects";
    }
    return "buffer";
  };
  
  ConcatStream.prototype.transformers = {
    string: function() {
      if(Buffer.isBuffer(this._buffer[0])) {
        return Buffer.concat(this._buffer.map(function(item) {
          if(Buffer.isBuffer(item)) {
            return item;
          }
          return new Buffer(item);
        })).toString("utf8");
      }
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
    },
    objects: function() {
      return this._buffer;
    }
  };
  
  ConcatStream.prototype.serialize = function () {
    var type = this.options.encoding || this.inferType(),
        t = this.transformers[type];
    
    if(t) {
      debug("searilize using %s transformer", type);
      return t.call(this);
    }
    return this._buffer;
    
  };
  
  concat = function(options, fn) {
    return new ConcatStream(options, fn);
  };
  
  concat.ctor = function() {
    return ConcatStream;
  };
  
  return concat;
  
}());