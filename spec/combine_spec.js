/*global describe, it, expect, __filename */

var through = require("../lib/through"),
    combine = require("../lib/combine"),
    split = require("../lib/split"),
    concat = require("../lib/concat"),
    fs = require("fs");

describe("combine", function() {
  
  it("should do simple pipe", function(done) {
    var pipeline = combine(split(), through.obj(function(chunk, enc, callback) {
      // console.log(chunk.toString().substr(0, 100));
      this.push(chunk.toString().substr(0, 100).toUpperCase());
      callback();
    }), through.obj(function(chunk, enc, callback) {
      this.push(chunk.toString().split("").reverse().join(""));
      callback();
    }), concat({objectMode: true, encoding: "objects"}, function(e, results) {
      expect(results[0].length).not.toBeGreaterThan(100);
      expect(results.length).toEqual(fs.readFileSync(__filename, "utf8").split("\n").length);
    }));
    fs.createReadStream(__filename).pipe(pipeline);
    pipeline.on("finish", done);
  });
  
  it("should not duplcate errors", function(done) {
    var errorCallback = jasmine.createSpy();
    var pipe = combine(through(function(chunk, enc, callback) {
      this.push(chunk);
      callback();
    }), through(function(chunk, enc, callback) {
      // this.emit("error", new Error());
      callback(new Error());
      // callback("error");
    }));
    pipe.on("error", errorCallback);
    pipe.write("fail!");
    // pipe.end();
    // pipe.on("end", done);
    setTimeout(function() {
      expect(errorCallback.calls.count()).toEqual(1);
      done();
    }, 100);
  });
  
  
  it("should duplicate errors in multiple pipes", function (done) {
    var pipe = combine(
      through(function(data, enc, callback) {
        this.push(data);
        callback();
      }),
      through(function(data, enc, callback) {
        this.emit("error", new Error(data));
        // var e = new Error();
        // callback(e);
      }),
      through()
    );
    var errorCb = jasmine.createSpy();
    pipe.on("error", errorCb);
    pipe.on("finish", function() {
      expect(errorCb).toHaveBeenCalled();
      expect(errorCb.calls.count()).toEqual(1);
      done();
    });
    pipe.write("meh");
    pipe.end();
  });
  

  
  
});
