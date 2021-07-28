const Redis = require("ioredis");
const { config } = require(".");

const redisConnection = new Redis(config.REDIS_URL);

module.exports = { 
  redisConnection
}

