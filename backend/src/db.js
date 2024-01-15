const { MongoClient } = require('mongodb');

if (!process.env.MONGO_URI) {
    throw new Error(`Missing env var: MONGO_URI`);
}

if (!process.env.DATABASE_NAME) {
    throw new Error(`Missing env var: DATABASE_NAME`);
}

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db(process.env.DATABASE_NAME);

module.exports = { db };
