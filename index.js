'use strict';
var redis = require('ioredis');

module.exports = (req, reqOptions, storeConfig, secondsToCache = 86400) => {
  let redisClient;

  if (!storeConfig || (Object.keys(storeConfig).length === 0 && storeConfig.constructor === Object)) {
    redisClient = new redis();
  } else if (typeof storeConfig.get === 'function') {
    redisClient = storeConfig;
  } else {
    redisClient = new redis(storeConfig);
  }

  const reqMethod = reqOptions.method && reqOptions.method.toLowerCase();
  const endpoint = reqOptions.url || reqOptions.uri || reqOptions.endpoint;

  return new Promise((resolve, reject) => {
    if (reqMethod === 'get') {
      redisClient.get(endpoint)
        .then(data => {
          if (!data) {
            req(reqOptions).then(res => {
              const redisResponseString = res.body ? JSON.stringify(res) : res;

              redisClient.setex(endpoint, secondsToCache, redisResponseString) // 86400 is 24 hours in seconds
                .then(() => resolve(res));
            }).catch(err => reject(err));
          } else {
            resolve(JSON.parse(data));
          }
        })
        .catch((err) => {
          console.log('wot in tarnation ', err);
          req(reqOptions)
            .then(res => resolve(res))
            .catch(err => reject(err));
        });
    }
    else {
      req(reqOptions)
        .then(response => resolve(response))
        .catch(err => reject(err));
    }
  });
};