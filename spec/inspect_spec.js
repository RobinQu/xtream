var inspect = require("../lib/inspect"),
    spigot = require("stream-spigot"),
    concat = require("../lib/concat");
    
    
describe("inspect", function() {
  
  describe("ctor", function() {
    it("should act as a constructor factory", function(done) {
      var count = 0;
      var Inspector = inspect.ctor(function () {
        count++;
      });
    
      var input = [
        {foo: "bar"},
        {foo: "baz"},
        {foo: "bif"},
        {foo: "blah"},
        {foo: "buzz"},
      ];
    
      // Input gets consumed, so make a copy for comparison.
      var copy = input.slice(0);
    
      function combine(e, records) {
        expect(count).toEqual(5);
        expect(copy).toEqual(records);
        done();
      }
      
      spigot({objectMode: true}, input)
        .pipe(new Inspector({objectMode: true}))
        .pipe(concat(combine));
    });
    
    it("should accept options", function (done) {

      var count = 0;
      var Inspector = inspect.ctor({objectMode: true}, function () {
        count++;
      });

      var input = [
        {foo: "bar"},
        {foo: "baz"},
        {foo: "bif"},
        {foo: "blah"},
        {foo: "buzz"},
      ];

      // Input gets consumed, so make a copy for comparison.
      var copy = input.slice(0);

      function combine(e, records) {
        expect(count).toEqual(5);
        expect(copy).toEqual(records);
        done();
      }

      spigot({objectMode: true}, input)
        .pipe(new Inspector())
        .pipe(concat({objectMode: true}, combine));
    });
    
    
    
    it("should support buffer stringify", function (done) {
      var seen = false;
      var Inspector = inspect.ctor({stringify: true}, function (chunk, index) {
        if (chunk === "e") {
          seen = true;
        }
      });
    
      function combine(e, result) {
        expect(seen).toBeTruthy();
        expect(result.toString()).toEqual("abcdef");
        done();
      }
    
      spigot([
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ]).pipe(new Inspector())
        .pipe(concat(combine));
    });
    
  });
  
  
  it("should handle simple inspect", function (done) {
    var count = 0;
    var s = inspect({objectMode: true}, function () {
      count++;
    });
  
    var input = [
      {foo: "bar"},
      {foo: "baz"},
      {foo: "bif"},
      {foo: "blah"},
      {foo: "buzz"},
    ];
  
    // Input gets consumed, so make a copy for comparison.
    var copy = input.slice(0);
  
    function combine(e, records) {
      expect(count).toEqual(5);
      expect(copy).toEqual(records);
      done();
    }
  
    spigot({objectMode: true}, input)
      .pipe(s)
      .pipe(concat({objectMode: true}, combine));
  });
  
  

  it("should return non-error", function (done) {
    // Non-error return is ignored.
    var count = 0;
    var s = inspect({objectMode: true}, function () {
      if (++count > 2) {
        return "WUT";
      }
    });

    var input = [
      {foo: "bar"},
      {foo: "baz"},
      {foo: "bif"},
      {foo: "blah"},
      {foo: "buzz"},
    ];

    // Input gets consumed, so make a copy for comparison.
    var copy = input.slice(0);

    function combine(e, records) {
      expect(count).toEqual(5);
      expect(copy).toEqual(records);
      done();
    }

    spigot({objectMode: true}, input)
      .pipe(s)
      .pipe(concat({objectMode: true}, combine));
  });
  

  it("should abort", function (done) {
    var count = 0;
    var s = inspect(function () {
      if (++count > 2) {
        return new Error("Aborting");
      }
    });

    s.on("error", function (e) {
      expect(e).toBeTruthy();
      expect(count).toEqual(3);
      done();
    });

    spigot([
      "a",
      "b",
      "cdefghijk",
      "lmnopqrst",
      "u",
      "vwxyz",
    ]).pipe(s);
  });
  

  it("should size abort options", function (done) {
    var s = inspect({maxBytes: 10, bytes: 0}, function (chunk) {
      this.options.bytes += chunk.length;
      if (this.options.bytes >= this.options.maxBytes) {
        return new Error("Aborting -- max size");
      }
    });
    var combine = jasmine.createSpy();
    s.on("error", function (e) {
      expect(e).toBeTruthy();
      expect(combine).not.toHaveBeenCalled();
      done();
    });


    spigot([
      "a",
      "b",
      "cdefghijk",
      "lmnopqrst",
      "u",
      "vwxyz",
    ]).pipe(s)
      .pipe(concat(combine));
  });
  

  it("should emit in inspector", function (done) {
    var s = inspect({maxBytes: 10, bytes: 0}, function (chunk) {
      this.emit("progress", "hi");
    });

    s.on("progress", function (msg) {
      expect(msg).toBeTruthy();
    });

    function combine(e, data) {
      expect(data.toString()).toEqual("abcdefghijklmnopqrstuvwxyz");
      done();
    }

    spigot([
      "a",
      "b",
      "cdefghijk",
      "lmnopqrst",
      "u",
      "vwxyz",
    ]).pipe(s)
      .pipe(concat(combine));
  });
  
});






