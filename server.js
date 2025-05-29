require('dotenv').config();
const express = require('express');
const { connectDB, getDB } = require('./db');
const { ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// === ROTAS FRONT ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/game.html'));
});

app.get('/scoreboard', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/scoreboard.html'));
});

app.get('/credits', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/credits.html'));
});

// === API ===

// CREATE
app.post('/scoreboard/api', async (req, res) => {
  const { name, score } = req.body;
  if (!name || !score) return res.status(400).send('Dados inválidos');

  try {
    const db = getDB();
    await db.collection('scoreboard').insertOne({
      name: name.toUpperCase(),
      score: Number(score),
      date: new Date(),
    });
    res.status(201).send('Pontuação salva!');
  } catch (err) {
    res.status(500).send('Erro ao salvar pontuação');
  }
});

// READ
app.get('/scoreboard/api', async (req, res) => {
  try {
    const db = getDB();
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

// DELETE
app.delete('/scoreboard/api/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('scoreboard').deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).send('ID não encontrado');
    }

    res.send('Pontuação deletada!');
  } catch (err) {
    res.status(500).send('Erro ao deletar pontuação');
  }
});

// EXPORT JSON
app.get('/scoreboard/download', async (req, res) => {
  try {
    const db = getDB();
    const scores = await db.collection('scoreboard').find().toArray();

    res.setHeader('Content-Disposition', 'attachment; filename="scoreboard.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(scores, null, 2));
  } catch (err) {
    res.status(500).send('Erro ao gerar JSON');
  }
});

// === INICIAR SERVIDOR ===
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
});