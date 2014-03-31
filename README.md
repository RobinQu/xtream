# xtream

[![Build Status](https://travis-ci.org/RobinQu/xtream.svg?branch=master)](https://travis-ci.org/RobinQu/xtream.js)


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

* xtream.duplex(readableStream, writableStream)

### Readable streams

* xtream.split

### Writeable streams

* xtream.concat

### Stream control

* xtream.combine


## References

* http://codewinds.com/blog/2013-08-31-nodejs-duplex-streams.html
* https://github.com/substack/stream-handbook