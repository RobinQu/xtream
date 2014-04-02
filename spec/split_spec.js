/*global describe, it, expect, __filename */

var split = require('..'), 
    join = require('path').join, 
    fs = require('fs'), 
    Stream = require('stream').Stream,
    split = require("../lib/split"),
    concat = require("../lib/concat"),
    Buffer = require("buffer").Buffer;


describe("split", function() {
  
  xit("should work like String#split", function(done) {
    fs.readFile(__filename, "utf-8", function(e, content) {
      var expected = content.split("\n");
      // console.log(expected.length);
      fs.createReadStream(__filename).pipe(split()).pipe(concat({objectMode: true, encoding: "objects"}, function(e, results) {
        // console.log(results.length);
        expect(results).toEqual(expected);
        done();
      }));
    });
  });
  
  it("should work with unicode", function(done) {
    var s = split(/,/g);
    var x = "テスト試験今日とても,よい天気で";
    var rows = [];
    var unicodeData = new Buffer(x);
    
    // partition of 日
    var piece1 = unicodeData.slice(0, 20);
    var piece2 = unicodeData.slice(20, unicodeData.length);
    s.on("readable", function() {
      while(null !== (chunk = s.read())) {
        rows.push(chunk);
      }
    });
    s.write(piece1);
    s.write(piece2);
    s.end();
    s.on("end", function() {
      expect(rows.length).toEqual(2);
      // expect(rows).toEqual(["テスト試験今日とても", "よい天気で"]);
      expect(rows).toEqual(x.split(","));
      done();
    });
    
  });
  
  xit("should limit max buffer", function() {
    var s = split({maxLength: 2}, JSON.parse);
    var errorCb = jasmine.createSpy();
    s.on("error", errorCb);
    s.on("end", function() {
      expect(errorCb).toHaveBeenCalledWith(jasmine.any(Error));
    });
    s.write("fdjalfkdsafdjks");
  });
  
  xdescribe("map function", function() {
    it("should take mapper function", function(done) {
      fs.readFile(__filename, "utf-8", function(e, content) {
        var expected = content.split("\n").map(function(line) {
          return line.trim().toUpperCase();
        });
        // console.log(expected.length);
        var s = split(function(line) {
          return line.trim().toUpperCase();
        });
        fs.createReadStream(__filename).pipe(s).pipe(concat({objectMode: true, encoding: "objects"}, function(e, results) {
          // console.log(results.length);
          expect(results).toEqual(expected);
          done();
        }));
      });
    });
    
    it("should emit mapper exceptions as error events", function(done) {
      var s = split(JSON.parse);
      var errorCb = jasmine.createSpy();
      s.on("error", errorCb);
      s.write("abc:2}");
      s.end();
      setTimeout(function() {
        expect(errorCb).toHaveBeenCalledWith(jasmine.any(Error));
        done();
      }, 10);
    });
    
    it("should emit error events in trailing chunks", function(done) {
      var s = split(JSON.parse);
      var errorCb = jasmine.createSpy();
      var rows = [];
      s.on("error", errorCb);
      s.on("readable", function() {
        rows.push(s.read());
      });
      s.write("{\"abc\":2}\n{\"b\"");
      expect(rows.length).toEqual(1);
      s.write(":2}\n{\"dk\":1}");
      expect(rows.length).toEqual(2);
      s.write(":2}");
      s.end();
      setTimeout(function() {
        expect(rows[0].abc).toEqual(2);
        expect(errorCb).toHaveBeenCalledWith(jasmine.any(Error));
        done();
      }, 10);
      
    });
  });
  
  
      
});
