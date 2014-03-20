/*global __filename */


var duplex = require("../lib/duplex"),
    fs = require("fs"),
    through = require("../lib/through"),
    PassThrough = require("stream").PassThrough;


// var th = new PassThrough();

var stream = duplex(fs.createReadStream(__filename), through(function(chunk, enc, callback) {
  console.log("start");
  console.log(chunk.toString());
  callback();
}));
// th.write("hello\n");
// th.write("world\n");
// th.end();

// fs.createReadStream(__filename).pipe(process.stdout);

stream.pipe(process.stdout);
// stream.write("ha");
// stream.write("heihei");
// th.pipe(process.stdout);
// stream.on("readable", function() {
//   console.log("stream readable");
//   var chunk;
//   while((chunk = stream.read()) !== null) {
//     console.log(chunk);
//   }
// });


// process.stdin.pipe(process.stdout);