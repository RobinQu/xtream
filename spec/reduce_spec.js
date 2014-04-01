/*global describe, it, expect */

var reduce = require("../lib/reduce"),
    spigot = require("stream-spigot"),
    concat = require("../lib/concat");


describe("reduce", function() {
  
  describe("ctor", function(done) {
    
    it("should act as a constructor factory", function(done) {
        var Sum = reduce.ctor(function (prev, curr) {
          return prev + curr;
        });
      
        function combine(e, result) {
          // console.log(result);
          expect(result.length).toEqual(1);
          expect(result[0]).toEqual(40);
          done();
        }
      
        spigot({objectMode: true}, [2, 4, 8, 2, 6, 8, 10])
          .pipe(new Sum({objectMode: true}))
          .pipe(concat(combine));
    });
    
    

    it("should accept an initial value", function (done) {
      var Sum = reduce.ctor(function (prev, curr) {
        return prev + curr;
      }, 5);
    
      function combine(e, result) {
        expect(result.length).toEqual(1);
        expect(result[0]).toEqual(45);
        done();
      }
      
      spigot({objectMode: true}, [2, 4, 8, 2, 6, 8, 10, 0])
        .pipe(new Sum({objectMode: true}))
        .pipe(concat({objectMode: true}, combine));
    });
    
    
    it("should use index & initial", function (done) {
      var mean = reduce({objectMode: true, foo: "bar"}, function (prev, curr, index) {
        expect(this.options.foo).toEqual("bar");
        // console.log(prev, curr, index);
        return prev - (prev - curr) / (index + 1);
      }, 0);
    
      function combine(e, result) {
        expect(result.length).toEqual(1);
        expect(result[0]).toEqual(5);
        done();
      }
    
      spigot({objectMode: true}, [2, 4, 8, 2, 6, 8, 10 ,0])
        .pipe(mean)
        .pipe(concat({objectMode: true},combine));
    });
    
  });
  

  it("should handle object", function (done) {
    var mean = reduce({objectMode: true}, function (prev, curr, index) {
      var meanWidgets = prev.widgets - (prev.widgets - curr.widgets) / (index + 1);
      prev.widgets = meanWidgets;
      prev.time = curr.time;
      return prev;
    }, {time: 0, widgets: 0});
  
    function combine(e, result) {
      expect(result.length).toEqual(1);
      expect(result[0]).toEqual({time: 8, widgets: 5.25});
      done();
    }
  
    spigot({objectMode: true}, [
      {time: 1, widgets: 2},
      {time: 2, widgets: 4},
      {time: 3, widgets: 8},
      {time: 4, widgets: 2},
      {time: 5, widgets: 6},
      {time: 6, widgets: 8},
      {time: 7, widgets: 10},
      {time: 8, widgets: 2},
      ])
      .pipe(mean)
      .pipe(concat({objectMode: true},combine));
  });
  
  
  it("should stringify", function (done) {
    var Sort = reduce.ctor({wantStrings: true}, function (prev, curr) {
      if (prev < curr) {
        return prev;
      }
      return curr;
    });
  
    function combine(e, result) {
      expect(result.toString()).toEqual("Bird");
      done();
    }
  
    spigot(["Cat", "Dog", "Bird", "Rabbit", "Elephant"])
      .pipe(new Sort())
      .pipe(concat({objectMode: true},combine));
  });
  
});






