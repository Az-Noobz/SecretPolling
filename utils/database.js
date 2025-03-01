const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI; // MongoDB connection string from .env
const client = new MongoClient(uri);

async function connectDB() {
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
    }
    return client.db("secret_polling"); // Database name
}

module.exports = connectDB;