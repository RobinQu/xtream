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

Transform stream helpers that mimick the Array operations.

### Passthrough streams

* xtream.inspect(streamOptions, inspectCallback)

Do nothing but emit every read data to `inspectCallback`

### Duplex streams

* xtream.duplex(streamOptions, readableStream, writableStream)

Generate a duplex stream that write to `writableStream`, read from `readableStream`

### Readable streams

* xtream.split(streamOptions, spliter, mapCallback);

Split emitted data using `spliter`. Optional `mapCallback` can be assigned to process each splited result.

### Writeable streams

* xtream.concat(completeCallback)

Collect all readable contents into the `completeCallback`.

### Stream control

* xtream.combine(fisrtStream, secondStream, thirdStream, ..., lastStream);

Generate a stream pipeline; Write to the first stream, read from last stream and each stream is piped to the next in line.

## References

* http://codewinds.com/blog/2013-08-31-nodejs-duplex-streams.html
* https://github.com/substack/stream-handbook