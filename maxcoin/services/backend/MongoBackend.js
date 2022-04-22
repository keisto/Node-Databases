/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
const { MongoClient } = require("mongodb");
const CoinAPI = require("../CoinAPI");

class MongoBackend {
  constructor() {
    this.coinAPI = new CoinAPI();
    this.mongoUrl = "mongodb://localhost:37017/maxcoin";
    this.client = null;
    this.collection = null;
  }

  async connect() {
    const mongoClient = new MongoClient(this.mongoUrl, {
      useNewUrlParser: true,
    });
    this.client = await mongoClient.connect();
    this.collection = this.client.db("maxcoin").collection("values");
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      return this.client.close();
    }

    return false;
  }

  async insert() {
    const data = await this.coinAPI.fetch();
    const documents = [];

    Object.entries(data.bpi).forEach((entry) => {
      documents.push({
        date: entry[0],
        value: entry[1],
      });
    });

    return this.collection.insertMany(documents);
  }

  async getMax() {
    return this.collection.findOne({}, { sort: { value: -1 } });
  }

  async max() {
    console.info("Connecting to MongoDB");
    console.time("mongodb-connect");

    try {
      const client = await this.connect();
      await client.db("maxcoin").command({ ping: 1 });

      console.info("Successfully connected to MonogoDB");
      console.timeEnd("mongodb-connect");

      console.info("Inserting into MongoDB");
      console.time("mongodb-insert");
      const insertResult = await this.insert();
      console.timeEnd("mongodb-insert");

      console.info(
        `Inserted: ${insertResult.insertedCount} documents into MongoDB`
      );

      console.info("Querying MongoDB");
      console.time("mongodb-find");
      const doc = await this.getMax();
      console.timeEnd("mongodb-find");

      return {
        date: doc.date,
        value: doc.value,
      };
    } finally {
      console.info("Disconnecting to MongoDB");
      console.time("mongodb-disconnect");
      await this.disconnect();
      console.timeEnd("mongodb-disconnect");
    }
  }
}

module.exports = MongoBackend;
