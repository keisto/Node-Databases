const MongoBackend = require("./services/backend/MongoBackend");
const RedisBackend = require("./services/backend/RedisBackend");
const MySQLBackend = require("./services/backend/MySQLBackend");
const CoinAPI = require("./services/CoinAPI");

async function runMongo() {
  const coinAPI = new CoinAPI();
  const mongoBackend = new MongoBackend();
  return mongoBackend.max();
  return coinAPI.fetch();
}

async function runRedis() {
  const redisBackend = new RedisBackend();
  return redisBackend.max();
}

async function runMySQL() {
  const mySQLBackend = new MySQLBackend();
  return mySQLBackend.max();
}

runMySQL()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => console.error(err));
