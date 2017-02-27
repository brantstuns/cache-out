const redis = require('ioredis');

module.exports = (req, reqOptions, storeConfig, secondsToCache = 86400) => {
  const port = storeConfig.port || storeConfig.options.port;
  const host = storeConfig.host || storeConfig.options.host;
  const db =  storeConfig.db;
  const password = storeConfig.password;
  let redisClient;

  if (!port || !host) {
     redisClient = new redis();
  } else if (db || password) {
    redisClient = new redis(port, host, {db, password})
  }

  const reqMethod = reqOptions.method.toLowerCase();
  const endpoint = reqOptions.url || reqOptions.uri || reqOptions.endpoint;
  const reqBody = reqOptions.body;

  return new Promise((resolve, reject) => {
    if (reqMethod === 'get') {
      console.log('made it here')
      redisClient.get(endpoint)
        .then(data => {
          console.log('db lookp a success ', data);
          if (!data) {
            console.log('was not found in redis')
            req(reqOptions).then(res => {
              redisClient.setex(endpoint, secondsToCache, JSON.stringify({body: res.body, statusCode: res.statusCode})) // 86400 is 24 hours in seconds
                .then(works => resolve(res));
            });
          } else {
            resolve(JSON.parse(data));
          }
        })
        .catch((err) => {
          console.log('wot in tarnation ', err);
          req(reqOptions).then(res => resolve(res));
        });
    }
  })
};