const fs = require("fs");
const { redisConnection } = require("../config/redis-connection");

const _pipe = redisConnection.pipeline();

const rawData = fs.readFileSync('cities.json');
const data = JSON.parse(rawData);

data.map(({ name }) => {
  name = name.toLowerCase();
  const key = `_city:${name}`;
  const values = { city: name };
  console.log({key, values});
  _pipe.hset(key, values);
})
_pipe.exec();
redisConnection.quit();
console.log('Loading list of city...');