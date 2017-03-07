[![Coverage Status](https://coveralls.io/repos/github/brantstuns/cache-out/badge.svg?branch=master)](https://coveralls.io/github/brantstuns/cache-out?branch=master)
[![Build Status](https://travis-ci.org/brantstuns/cache-out.svg?branch=master)](https://travis-ci.org/brantstuns/cache-out)
[![npm version](https://badge.fury.io/js/cache-out.svg)](https://badge.fury.io/js/cache-out)
[![Dependency Status](https://david-dm.org/brantstuns/cache-out.svg)](https://david-dm.org/boennemann/badges)
[![NPM](https://nodei.co/npm/cache-out.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/cache-out/)
# Cache Out 💸

Lets be honest. Slow responding, flaky, and fluctuating services really hurt. They hurt everyone from our apps' users to our apps' hard working developers. Caching their responses is a great way to mitigate this pain. 

Cache out is simple tool to use in place of your service requests that will cache service responses for a specified time so all your users don't have to have a bad day because one of your services is having a bad day 🤠. 

It is backed by Redis so you will have to have a Redis instance running for this work! It also uses ES6 and supports promises!

## Install:
```
npm i cache-out
```

## Example useage:
```javascript
var cacheOut = require('cache-out');
var request = require('request-promise');
var requestOpts = {url: 'http://www.slowservice.com/uncool/why/do/you/have/to/be/that/way', method: 'GET'};
var redisConfig = {port: 6379, host: 'localhost', db: 0, password: ''}; // Must follow this format to work: https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options

cacheOut(request, requestOpts, redisConfig, 604800 // optional time in seconds to cache response)
  .then((res) => console.log('Wow, that was so fast! ', res));
```

More to come...
