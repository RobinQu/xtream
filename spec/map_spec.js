/*global describe, it, expect */

var map = require("../lib/map"),
    spigot = require("stream-spigot"),
    concat = require("../lib/concat");


describe("map", function() {
  
  describe("ctor", function() {
    it("should act as a constructor factory", function(done) {
      var Map = map.ctor(function (record) {
        record.foo.toUpperCase();
        return record;
      });
    
      var s = new Map({objectMode: true});

      function combine(e, records) {
        expect(records.length).toEqual(5);
        expect(records.filter(function (r) { return (/^[A-Z]$/).exec(r.foo); }).length).toBeFalsy();
        done();
      }

      spigot({objectMode: true}, [
        {foo: "bar"},
        {foo: "baz"},
        {foo: "bif"},
        {foo: "blah"},
        {foo: "buzz"},
      ])
        .pipe(s)
        .pipe(concat({objectMode: true}, combine));
    });
    
    it("should accept options", function(done) {
      var Map = map.ctor({objectMode: true, foo: "bar"}, function (record) {
        expect(this.options.foo).toEqual("bar");
        record.foo.toUpperCase();
        return record;
      });

      function combine(e, records) {
        expect(records.length).toEqual(5);
        expect(records.filter(function (r) { return (/^[A-Z]$/).exec(r.foo); }).length).toBeFalsy();
        done();
      }

      spigot({objectMode: true}, [
        {foo: "bar"},
        {foo: "baz"},
        {foo: "bif"},
        {foo: "blah"},
        {foo: "buzz"},
      ])
        .pipe(new Map({objectMode: true}))
        .pipe(concat({objectMode: true}, combine));
    });
    
    
    it("ctor support stringify", function (done) {

      var Map = map.ctor({stringify: true}, function (chunk, index) {
        return (index % 2 === 0) ? chunk.toUpperCase() : chunk;
      });

      function combine(e, result) {
        expect(result.toString()).toEqual("AbCdEf");
        done();
      }

      spigot([
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ]).pipe(new Map())
        .pipe(concat(combine));
    });
    
  });
  
  it("should do simple map", function(done) {
    var m = map({objectMode: true}, function (record) {
      record.foo.toUpperCase();
      return record;
    });

    function combine(e, records) {
      expect(records.length).toEqual(5);
      expect(records.filter(function (r) { return (/^[A-Z]$/).exec(r.foo); }).length).toBeFalsy();
      done();
    }

    spigot({objectMode: true}, [
      {foo: "bar"},
      {foo: "baz"},
      {foo: "bif"},
      {foo: "blah"},
      {foo: "buzz"},
    ])
      .pipe(m)
      .pipe(concat({objectMode: true}, combine));
  });
  
  it("should handle simple buffers", function(done) {
    var f = map({objectMode: true}, function (chunk) {
      return chunk.slice(0, 5);
    });

    function combine(e, result) {
      expect(result.toString()).toEqual("abcdefglmnopuvwxyz");
      done();
    }

    spigot([
      "a",
      "b",
      "cdefghijk",
      "lmnopqrst",
      "u",
      "vwxyz",
    ]).pipe(f)
      .pipe(concat(combine));
  });
  
  

  it("should end early", function (done) {
    var count = 0;
    var f = map(function (chunk) {
      if (++count > 1) {
        return null;
      }
      return chunk;
    });

    function combine(e, result) {
      expect(result.toString()).toEqual("a");
      done();
    }

    spigot([
      "a",
      "b",
      "cdefghijk",
      "get",
      "u",
      "vwxyz",
    ]).pipe(f)
      .pipe(concat({objectMode: true}, combine));
  });
});