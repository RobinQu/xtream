/*global __filename */

var through = require("../lib/through"),
    fs = require("fs"),
    stream;
    

stream = through(function(chunk, enc, callback) {
  chunk = chunk.toString();
  this.push(chunk);
  callback();
});

fs.createReadStream(__filename).pipe(stream);

// stream.on("readable", function() {
//   var chunk;
//   while((chunk = stream.read()) !== null) {
//     console.log(chunk.toString());
//   }
// });
