/*global describe, it, expect */

var concat = require('../lib/concat'),
    Buffer = require("buffer").Buffer;

describe("concat", function() {
  
  describe("objects", function() {
    it("should write objects", function(done) {
      var stream = concat({encoding: "objects"}, function(e, objs) {
        expect(objs.length).toEqual(2);
        expect(objs[0]).toEqual({"foo": "bar"});
        expect(objs[1]).toEqual({"baz": "taco"});
        done();
      });
    
      stream.write({"foo": "bar"});
      stream.write({"baz": "taco"});
      stream.end();
    });
  });
  
  describe("string", function() {
    
    it("should handle buffers", function(done) {
      var strings = concat({ encoding: 'buffer'}, function(e, out) {
        expect(Buffer.isBuffer(out)).toBeTruthy();
        expect(out.toString("utf8")).toEqual("nacho dogs");
        done();
      });
      strings.write("nacho ");
      strings.write("dogs");
      strings.end();
    });
    
    it("should handle strings", function (done) {
      var strings = concat({ encoding: "string" }, function(e, out) {
        expect(typeof out).toEqual("string");
        expect(out).toEqual("nacho dogs");
        done();
      });
      strings.write("nacho ");
      strings.write("dogs");
      strings.end();
    });
    
    it("should accept end chunk", function (done) {
      var endchunk = concat({ encoding: "string" }, function(e, out) {
        expect(out).toEqual("this is the end");
        done();
      });
      endchunk.write("this ");
      endchunk.write("is the ");
      endchunk.end("end");
    });
    
    // it("should output string from mixed write encodings", function (done) {
    //   var strings = concat({ encoding: "string" }, function(out) {
    //     t.equal(typeof out, "string");
    //     t.equal(out, "nacho dogs");
    //   })
    //   strings.write("na");
    //   strings.write(Buffer("cho"));
    //   strings.write([ 32, 100 ]);
    //   var u8 = new U8(3);
    //   u8[0] = 111; u8[1] = 103; u8[2] = 115;
    //   strings.end(u8)
    // })
    
    it("should accept string from buffers with multibyte characters", function (done) {
      var strings = concat({ encoding: "string" }, function(e, out) {
        expect(typeof out).toEqual("string");
        expect(out).toEqual("☃☃☃☃☃☃☃☃");
        done();
      });
      var snowman = new Buffer("☃"),
          i;
      for (i = 0; i < 8; i++) {
        strings.write(snowman.slice(0, 1));
        strings.write(snowman.slice(1));
      }
      strings.end();
    });
    
    
  });
  

  
});