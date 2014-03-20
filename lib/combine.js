module.exports = (function() {
  "use strict";
  
  var duplex = require("./duplex");
  
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
    pipeline = duplex(streams[0], streams[streams.length-1]);
    onerror = function(e) {
      pipeline.emit(e);
    };
    
    for(i=0,len=streams.length-2; i<len; i++) {
      streams[i].pipe(streams[i+1]);
      streams[i].on("error", onerror);
    }
    streams.forEach(function(s) {
      s.on("error", onerror);
    });
    
    return pipeline;
  };
  
  return combine;
  
}());