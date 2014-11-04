/*global describe, it, expect */

var filter = require("../lib/filter"),
    concat = require("../lib/concat"),
    spigot = require("stream-spigot");

describe("filter", function () {

  it("should have working ctor", function(done) {
    var Filter = filter.ctor(function (record) {
      console.log(record);
      return !record.skip;
    });
    function combine(e, records) {
      expect(records.length).toEqual(3);
      expect(records.filter(function (r) { return r.skip; }).length).toBeFalsy();
      done();
    }

    spigot({objectMode: true}, [
      {foo: "bar"},
      {foo: "baz", skip: true},
      {foo: "bif", skip: true},
      {foo: "blah"},
      {foo: "buzz"},
    ]).pipe(new Filter({objectMode: true}))
      .pipe(concat(combine));
  });
  
  it("should accept options in ctor", function(done) {
    var Filter = filter.ctor({objectMode: true, foo: "bar"}, function (record) {
      expect(this.options.foo).toEqual("bar");
      return !record.skip;
    });
  
    function combine(e, records) {
      expect(records.length).toEqual(3);
      expect(records.filter(function (r) { return r.skip; }).length);
      done();
    }
  
    spigot({objectMode: true}, [
      {foo: "bar"},
      {foo: "baz", skip: true},
      {foo: "bif", skip: true},
      {foo: "blah"},
      {foo: "buzz"},
    ])
      .pipe(new Filter())
      .pipe(concat(combine));
  });
  
  it("should support stringify in options", function(done) {
    var Filter = filter.ctor({stringify: true}, function (chunk) {
      return chunk.length <= 5;
    });
  
    function combine(e, result) {
      expect(result.toString()).toEqual("abuvwxyz");
      done();
    }
  
    spigot([
      "a",
      "b",
      "cskipk",
      "lmnopqrstskip",
      "u",
      "vwxyz",
    ]).pipe(new Filter())
      .pipe(concat(combine));
  
  });
  
  
  
  it("should filter", function(done) {
    var f = filter({objectMode: true}, function (record) {
      return !record.skip;
    });
  
    function combine(e, records) {
      expect(records.length).toEqual(3);
      expect(records.filter(function (r) { return r.skip; }).length).toBeFalsy();
      done();
    }
  
    spigot({objectMode: true}, [
      {foo: "bar"},
      {foo: "baz", skip: true},
      {foo: "bif", skip: true},
      {foo: "blah"},
      {foo: "buzz"},
    ])
      .pipe(f)
      .pipe(concat(combine));
  });
  
  it("should hanlde buffers", function(done) {
    var f = filter({objectMode: true}, function (chunk) {
      return chunk.length <= 5;
    });
  
    function combine(e, result) {
      expect(result.toString()).toEqual("abuvwxyz");
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
  
  it("should support index", function(done) {
    var f = filter({objectMode: true}, function (record, index) {
      return index < 2;
    });
  
    function combine(e, records) {
      expect(records, [{foo: "bar"},{foo: "baz"}]);
      done();
    }
  
    spigot({objectMode: true}, [
      {foo: "bar"},
      {foo: "baz"},
      {foo: "bif"},
      {foo: "blah"},
      {foo: "buzz"},
    ])
      .pipe(f)
      .pipe(concat(combine));
  });

});