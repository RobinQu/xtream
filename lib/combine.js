module.exports = (function() {
  "use strict";
  
  var duplex = require("./duplex"),
      debug = require("debug")("xtream:combine");
  
  var combine = function() {
    var streams = Array.prototype.slice.apply(arguments),
        pipeline,
        i, len,
        onerror;
    
    if(!streams.length) {
      throw new Error("no streams given");
    }
    if(streams.length === 1) {
      return streams[0];
    }
    debug("duplex %s, 0", streams.length-1);
    //read from last stream, write to first stream
    pipeline = duplex(streams[streams.length-1], streams[0]);
    onerror = function() {
      debug("stream error");
      pipeline.emit.apply(pipeline, ["error"].concat(arguments));
    };
    
    for(i=0,len=streams.length; i<len-1; i++) {
      debug("pipe %s to %s", i, i+1);
      streams[i].pipe(streams[i+1]);
    }
    for(i=1,len=streams.length; i<len-1; i++) {
      debug("bind error on stream %s", i);
      streams[i].on("error", onerror);
    }
    
    return pipeline;
  };
  
  return combine;
  
}());