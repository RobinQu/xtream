# xtream

[![NPM](https://nodei.co/npm/xtream.png)](https://nodei.co/npm/xtream/)


[![Build Status](https://travis-ci.org/RobinQu/xtream.svg?branch=master)](https://travis-ci.org/RobinQu/xtream)

`stream2` helpers, inspired by `rvagg/through2` and its friends

## TL;DL

### Ttransform stream

* xtream.through(streamOptions, transform, flush)
* xtream.map(streamOptions, mapCallback)
* xtream.reduce(streamOptions, reduceCallback, initial)
* xtream.filter(streamOptions, filterCallback)

### Passthrough streams

* xtream.inspect(streamOptions, inspectCallback)

### Duplex streams

* xtream.duplex(streamOptions, readableStream, writableStream)

### Readable streams

* xtream.split(options, spliter, mapCallback);

### Writeable streams

* xtream.concat(completeCallback)

### Stream control(untested)

* xtream.combine


## References

* http://codewinds.com/blog/2013-08-31-nodejs-duplex-streams.html
* https://github.com/substack/stream-handbook