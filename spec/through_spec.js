/*global describe, it, expect */

var through = require("../lib/through"), 
    crypto = require("crypto"), 
    bl = require("bl"), 
    spigot = require("stream-spigot"),
    Buffer = require("buffer").Buffer;

describe("through", function() {
  
  it("should handle plain through", function (done) {
    var th = through(function (chunk, enc, callback) {
      if (!this._i) {
        this._i = 97; // "a"
      } else {
        this._i++;
      } 
      var b = new Buffer(chunk.length),
          i;
      for (i = 0; i < chunk.length; i++) {
        b[i] = this._i;
      }
      this.push(b);
      callback();
    });

    th.pipe(bl(function (err, b) {
      var s = b.toString("ascii");
      expect(s).toEqual("aaaaaaaaaabbbbbcccccccccc");
      done();
    }));

    th.write(crypto.randomBytes(10));
    th.write(crypto.randomBytes(5));
    th.write(crypto.randomBytes(10));
    th.end();
  });
  
  
  it("should be pipeable through", function (done) {
    var th = through(function (chunk, enc, callback) {
      if (!this._i) {
        this._i = 97; // "a"
      } else {
        this._i++;
      }
      
      var b = new Buffer(chunk.length);
      var i = 0;
      for (i = 0; i < chunk.length; i++) {
        b[i] = this._i;
      }
      this.push(b);
      callback();
    });

    th.pipe(bl(function (err, b) {
      var s = b.toString("ascii");
      // bl() acts like a proper streams2 stream and passes as much as it"s
      // asked for, so we really only get one write with such a small amount
      // of data
      expect(s).toEqual("aaaaaaaaaaaaaaaaaaaaaaaaa");
      done();
    }));

    var bufs = bl();
    bufs.append(crypto.randomBytes(10));
    bufs.append(crypto.randomBytes(5));
    bufs.append(crypto.randomBytes(10));
    bufs.pipe(th);
  });
  
  
  it("should enable object through stream", function (done) {
    var th = through({ objectMode: true}, function (chunk, enc, callback) {
      this.push({ out: chunk.in + 1 });
      callback();
    });

    var e = 0;
    th.on("data", function (o) {
      expect(o).toEqual({ out: e === 0 ? 102 : e === 1 ? 203 : -99 });
      e++;
    });
    th.on("end", done);

    th.write({ in: 101 });
    th.write({ in: 202 });
    th.write({ in: -100 });
    th.end();
  });
  
  
});


describe("through.obj", function(done) {
  
  it("should let object pass through", function(done) {
    var th = through.obj(function (chunk, enc, callback) {
      this.push({ out: chunk.in + 1 });
      callback();
    });

    var e = 0;
    th.on("data", function (o) {
      expect(o).toEqual({ out: e === 0 ? 102 : e === 1 ? 203 : -99 });
      e++;
    });
    th.on("end", done);
    
    th.write({ in: 101 });
    th.write({ in: 202 });
    th.write({ in: -100 });
    th.end();
  });

});

describe("through with flushing", function() {
  
  it("should flush through", function (done) {
    var th = through(function (chunk, enc, callback) {
      if (!this._i) {
        this._i = 97; // "a"
      } else {
        this._i++;
      }
      var b = new Buffer(chunk.length),
          i;
      for (i = 0; i < chunk.length; i++) {
        b[i] = this._i;
      }
      this.push(b);
      callback();
    }, function (callback) {
      this.push(new Buffer([ 101, 110, 100 ]));
      callback();
    });

    th.pipe(bl(function (err, b) {
      var s = b.toString("ascii");
      expect(s).toEqual("aaaaaaaaaabbbbbccccccccccend");
      done();
    }));

    th.write(crypto.randomBytes(10));
    th.write(crypto.randomBytes(5));
    th.write(crypto.randomBytes(10));
    th.end();
  });
  
  
});

describe("through ctor", function() {
  
  it("should act as a constructor", function (done) {
    var Th = through.ctor(function (chunk, enc, callback) {
      if (!this._i) {
        this._i = 97; // "a"
      } else {
        this._i++;
      }
        
      var b = new Buffer(chunk.length),
          i;
      for (i = 0; i < chunk.length; i++) {
        b[i] = this._i;
      }
      this.push(b);
      callback();
    });

    var th = new Th();

    th.pipe(bl(function (err, b) {
      var s = b.toString("ascii");
      expect(s).toEqual("aaaaaaaaaabbbbbcccccccccc");
      done();
    }));

    th.write(crypto.randomBytes(10));
    th.write(crypto.randomBytes(5));
    th.write(crypto.randomBytes(10));
    th.end();
  });
  
  it("should be able to reuse through ctor", function (done) {

    var Th = through.ctor(function (chunk, enc, callback) {
      if (!this._i) {
        this._i = 97; // "a"
      } else {
        this._i++;
      }
      var b = new Buffer(chunk.length),
          i;
      for (i = 0; i < chunk.length; i++) {
        b[i] = this._i;
      }
      this.push(b);
      callback();
    });
  
    var th = new Th();

    th.pipe(bl(function (err, b) {
      var s = b.toString("ascii");
      expect(s).toEqual("aaaaaaaaaabbbbbcccccccccc");

      var newInstance = new Th();
      newInstance.pipe(bl(function (err, b) {
        var s = b.toString("ascii");
        expect(s).toEqual("aaaaaaabbbbccccccc");
        done();
      }));

      newInstance.write(crypto.randomBytes(7));
      newInstance.write(crypto.randomBytes(4));
      newInstance.write(crypto.randomBytes(7));
      newInstance.end();
    }));

    th.write(crypto.randomBytes(10));
    th.write(crypto.randomBytes(5));
    th.write(crypto.randomBytes(10));
    th.end();
  });
  
});

describe("through object ctor", function() {
  
  it("should be ok", function (done) {
  
    var Th = through.ctor({ objectMode: true}, function (chunk, enc, callback) {
      this.push({ out: chunk.in + 1 });
      callback();
    });
  
    var th = new Th();
  
    var e = 0;
    th.on("data", function (o) {
      expect(o).toEqual({ out: e === 0 ? 102 : e === 1 ? 203 : -99 });
      e++;
    });
    th.on("end", done);
  
    th.write({ in: 101 });
    th.write({ in: 202 });
    th.write({ in: -100 });
    th.end();
  });
  
  it("should be pipeable object through ctor", function (done) {
  
    var Th = through.ctor({ objectMode: true}, function (record, enc, callback) {
      if (record.temp !== null && record.unit === "F") {
        record.temp = ( ( record.temp - 32 ) * 5 ) / 9;
        record.unit = "C";
      }
      this.push(record);
      callback();
    });

    var th = new Th();

    var expects = [-19, -40, 100, 22];
    th.on("data", function (o) {
      expect(o).toEqual({ temp: expects.shift(), unit: "C" });
    });
    th.on("end", done);

    spigot({objectMode: true}, [
      {temp: -2.2, unit: "F"},
      {temp: -40, unit: "F"},
      {temp: 212, unit: "F"},
      {temp: 22, unit: "C"}
    ]).pipe(th);
  });
  
  
  it("should support override", function (done) {

    var Th = through.ctor(function (chunk, enc, callback) {
      this.push({ out: chunk.in + 1 });
      callback();
    });

    var th = new Th({objectMode: true});

    var e = 0;
    th.on("data", function (o) {
      expect(o).toEqual({ out: e === 0 ? 102 : e === 1 ? 203 : -99 });
      e++;
    });
    th.on("end", done);

    th.write({ in: 101 });
    th.write({ in: 202 });
    th.write({ in: -100 });
    th.end();
  });
  
  
  it("should accept object settings available in transform", function (done) {
  
    var Th = through.ctor({objectMode: true, peek: true}, function (chunk, enc, callback) {
      this.push({ out: chunk.in + 1 });
      callback();
    });

    var th = new Th();

    var e = 0;
    th.on("data", function (o) {
      expect(o).toEqual({ out: e === 0 ? 102 : e === 1 ? 203 : -99 });
      e++;
    });
    th.on("end", done);

    th.write({ in: 101 });
    th.write({ in: 202 });
    th.write({ in: -100 });
    th.end();
  });
  
  it("should accept overridden settings available in transform", function (done) {

    var Th = through.ctor(function (chunk, enc, callback) {
      this.push({ out: chunk.in + 1 });
      callback();
    });

    var th = new Th({objectMode: true, peek: true});

    var e = 0;
    th.on("data", function (o) {
      expect(o).toEqual({ out: e === 0 ? 102 : e === 1 ? 203 : -99 });
      e++;
    });
    th.on("end", done);

    th.write({ in: 101 });
    th.write({ in: 202 });
    th.write({ in: -100 });
    th.end();
  });
  
  it("should extend overridden options", function (done) {

    var Th = through.ctor({objectMode: true}, function (chunk, enc, callback) {
      this.push({ out: chunk.in + 1 });
      callback();
    });

    var th = new Th({peek: true});

    var e = 0;
    th.on("data", function (o) {
      expect(o).toEqual({ out: e === 0 ? 102 : e === 1 ? 203 : -99 });
      e++;
    });
    th.on("end", done);

    th.write({ in: 101 });
    th.write({ in: 202 });
    th.write({ in: -100 });
    th.end();
  });
  
});