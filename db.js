const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.URI);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('pontuacao'); // Nome do banco
        console.log('✅ Conectado ao MongoDB Atlas');
    } catch (error) {
        console.error('❌ Erro ao conectar no MongoDB:', error);
    }
}

function getDB() {
    if (!db) {
        throw new Error('DB não conectado');
    }
    return db;
}

module.exports = { connectDB, getDB };
