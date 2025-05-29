require('dotenv').config();

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: true // só para testar, tirar depois
});

let db;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));


// Conectar ao MongoDB
async function conectarDB() {
  try {
    await client.connect();
    db = client.db('duck_hunt');
    console.log('🟢 Banco conectado com sucesso!');
  } catch (err) {
    console.error('❌ Erro na conexão com MongoDB:', err);
  }
}

// Rotas que servem os arquivos HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

app.get('/scoreboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'scoreboard.html'));
});

app.get('/credits', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'credits.html'));
});

// API para salvar pontuação
app.post('/scoreboard/api', async (req, res) => {
  const { name, score } = req.body;
  if (!name || !score) return res.status(400).send('Nome e pontuação obrigatórios.');

  try {
    await db.collection('scoreboard').insertOne({
      name: name.toUpperCase(),
      score: parseInt(score),
      date: new Date()
    });
    res.status(201).send('Pontuação salva!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao salvar pontuação');
  }
});

// API para listar as top 10 pontuações
app.get('/scoreboard/api', async (req, res) => {
  try {
    const scores = await db.collection('scoreboard')
      .find()
      .sort({ score: -1 })
      .limit(10)
      .toArray();
    res.json(scores);
  } catch (err) {
    res.status(500).send('Erro ao buscar pontuações');
  }
});

// API para deletar pontuação por id
app.delete('/scoreboard/api/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('scoreboard').deleteOne({ _id: new ObjectId(id) });
    res.send('Pontuação deletada!');
  } catch (err) {
    res.status(500).send('Erro ao deletar pontuação');
  }
});

// API para baixar as pontuações em JSON
app.get('/scoreboard/download', async (req, res) => {
  try {
    const scores = await db.collection('scoreboard').find().toArray();
    res.setHeader('Content-Disposition', 'attachment; filename="scores.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(scores, null, 2));
  } catch (err) {
    res.status(500).send('Erro ao gerar JSON');
  }
});

// Iniciar servidor após conectar DB
conectarDB().then(() => {
  app.listen(3000, () => {
    console.log('🚀 Servidor rodando em http://localhost:3000');
  });
});