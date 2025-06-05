const express = require('express');
const mongoose = require('mongoose');
const { json } = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(json());
app.use(express.static('public'));

// Connect to MongoDB
let conn = null;
async function connectToDB() {
  if (conn) return conn;
  conn = await mongoose.connect(process.env.MONGODB_URI, {
    authSource: 'admin',
  });
  return conn;
}

// Schema and Model
const feedbackSchema = new mongoose.Schema({
  name: String,
  feedback: String,
  createdAt: { type: Date, default: Date.now },
});
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

// Routes
app.post('/api/feedback', async (req, res) => {
  await connectToDB();
  const { name, feedback } = req.body;
  try {
    const fb = new Feedback({ name, feedback });
    await fb.save();
    res.status(201).json({ message: 'Feedback saved' });
  } catch {
    res.status(500).json({ error: 'Failed to save' });
  }
});

app.get('/api/feedback', async (req, res) => {
  await connectToDB();
  try {
    const list = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch {
    res.status(500).json({ error: 'Error retrieving feedback' });
  }
});

app.get('/secret-feedback-view-123', (req, res) => {
  res.sendFile(__dirname + '/public/viewFeedback.html');
});

// Vercel serverless export
const serverless = require('serverless-http');
module.exports = serverless(app);
