[![Coverage Status](https://coveralls.io/repos/github/brantstuns/cache-out/badge.svg?branch=master)](https://coveralls.io/github/brantstuns/cache-out?branch=master)
[![Build Status](https://travis-ci.org/brantstuns/cache-out.svg?branch=master)](https://travis-ci.org/brantstuns/cache-out)
[![npm version](https://badge.fury.io/js/cache-out.svg)](https://badge.fury.io/js/cache-out)
[![Dependency Status](https://david-dm.org/brantstuns/cache-out.svg)](https://david-dm.org/boennemann/badges)

# 💶 💷 Cache Out 💵 💴
Cache out is simple tool to use in place of your service requests that will cache service responses for a specified time so all your users don't have to have a bad day because one of your services is. 

It is backed by Redis so you will have to have a Redis instance running for this work. It also uses ES6, ioredis and returns a promise!

## Install:
```
npm i cache-out --save
```

## API:
### cache-out(requestMethod, requestOptions, [redisOptions], [secondsToCache])

###### Calls your requestMethod with the requestOptions and caches the response in redis for the secondsToCache. If something goes wrong it's just a call through to your request.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| requestMethod | function | _required_ | the function that you would be replacing cache-out with (ex [request-promise-native](https://github.com/request/request-promise-native)) |
| requestOptions | object | _required_ | the options object you would be passing to the function above |
| redisOptions | object | If no argument is passed a default ioredis client will be created | this is not required but if you want to specify you're redis setup (which you definitely are going to have to do at some point) then make sure it follows the [options object](https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options) specified for ioredis. Alternatively, you can pass in a pre instantiated redis client here too! Cache-out will use the passed in client if this is the case. |
| secondsToCache | number | 86400 (which 24 hours in seconds) | The amount of time in seconds you want to cache the response in redis for |

## Example useage:
```javascript
var cacheOut = require('cache-out');
var request = require('request-promise');
var requestOpts = {url: 'http://www.url.com/uncool/why/', method: 'GET'};
var redisConfig = {port: 6379, host: 'localhost', db: 0, password: ''};

cacheOut(request, requestOpts, redisConfig, 604800)
  .then((res) => console.log('Wow, that was fast! ', res));
```

## Testing:

The redisOptions argument accepts a redis client. I recommend using a [mock redis client](https://github.com/stipsan/ioredis-mock) and passing this into cache-out if your NODE_ENV === 'test'.

💰
