/*global describe, it, expect, __filename */

var duplex = require("../lib/duplex"),
    spigot = require("stream-spigot"),
    concat = require("../lib/concat"),
    through = require("../lib/through"),
    fs = require("fs"),
    Buffer = require("buffer").Buffer;

describe("duplex", function() {
  
  it("should be readable after combined", function(done) {
    var readable = fs.createReadStream(__filename),
        writable = through(),
        s = duplex(readable, writable);
    
    //readable part
    s.pipe(concat(function(e, result) {
      expect(Buffer.isBuffer(result)).toBeTruthy();
      expect(result.toString()).toEqual(fs.readFileSync(__filename, "utf8"));
      done();
    }));
    
  });
  
  it("should be writable after combined", function(done) {
    var readable = through();
    var writable = concat(function(e, result) {
      expect(Buffer.isBuffer(result)).toBeTruthy();
      expect(result.toString("utf8")).toEqual(fs.readFileSync(__filename, "utf8"));
      done();
    });
    var s = duplex(readable, writable);
    
    //writable part
    var file = fs.createReadStream(__filename);
    file.pipe(s);
    
  });
  
  describe("object mode", function() {
    
    it("should be readable after combined", function(done) {
      var readable = spigot({objectMode: true}, [1,2,3,4]);
      var writable = concat({objectMode: true}, function(e, results) {
        expect(results.length).toEqual(5);
        expect(results[4]).toEqual(9);
      });
      var s = duplex({objectMode: true}, readable, writable);
      //readable part
      s.pipe(concat(function(e, results) {
        expect(results.length).toEqual(4);
        expect(results[3]).toEqual(4);
        done();
      }));
    
    });
    
    it("should be writable after combined", function(done) {
      //writable part
      var readable = through();
      var writable = concat({objectMode: true}, function(e, results) {
        expect(results.length).toEqual(5);
        expect(results[4]).toEqual(9);
        done();
      });
      var s = duplex({objectMode: true}, readable, writable);
      spigot({objectMode: true}, [5,6,7,8, 9]).pipe(s);
      
    });
    
  });
  

  
});