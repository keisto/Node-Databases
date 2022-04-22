/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
const CoinAPI = require("../CoinAPI");
const Redis = require("ioredis");

class RedisBackend {
  constructor() {
    this.coinAPI = new CoinAPI();
    this.client = null;
  }

  async connect() {
    this.client = new Redis(7379);
    return this.client;
  }

  async disconnect() {
    return this.client.disconnect();
  }

  async insert() {
    const data = await this.coinAPI.fetch();
    const values = [];
    Object.entries(data.bpi).forEach((entries) => {
      values.push(entries[1]);
      values.push(entries[0]);
    });

    return this.client.zadd("maxcoin:values", values);
  }

  async getMax() {
    return this.client.zrange("maxcoin:values", -1, -1, "WITHSCORES");
  }

  async max() {
    console.info("Connecting to Redis");
    console.time("redis-connect");

    try {
      const client = this.connect();

      console.info("Successfully connected to Redis");
      console.timeEnd("redis-connect");

      console.info("Inserting into Redis");
      console.time("redis-insert");
      const insertResult = await this.insert();
      console.timeEnd("redis-insert");

      console.info(`Inserted: ${insertResult} documents into Redis`);

      console.info("Querying Redis");
      console.time("redis-find");
      const result = await this.getMax();
      console.timeEnd("redis-find");

      return result;
    } finally {
      console.info("Disconnecting to Redis");
      console.time("redis-disconnect");
      await this.disconnect();
      console.timeEnd("redis-disconnect");
    }
  }
}

module.exports = RedisBackend;
