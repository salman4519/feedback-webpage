const express = require('express');
const mongoose = require('mongoose');
const { json } = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({ origin: 'salmans-feedback-9ty7060zf.vercel.app' })); // Update with your Vercel URL
app.use(json());
app.use(express.static('public'));

// Connect to MongoDB
let conn = null;
async function connectToDB() {
  if (conn) return conn;
  conn = await mongoose.connect(process.env.MONGODB_URI, {
    authSource: 'admin',
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');
  return conn;
}

// Schema and Model
const feedbackSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous' },
  feedback: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

// Routes
app.post('/api/feedback', async (req, res) => {
  await connectToDB();
  const { name, feedback, rating } = req.body;
  try {
    const fb = new Feedback({ name: name || 'Anonymous', feedback, rating });
    await fb.save();
    res.status(201).json({ message: 'Feedback saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save' });
  }
});

app.get('/api/feedback', async (req, res) => {
  await connectToDB();
  const { password } = req.query;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const list = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving feedback' });
  }
});

app.get('/secret-feedback-view-123', (req, res) => {
  res.sendFile(__dirname + '/public/viewFeedback.html');
});

// Vercel serverless export
const serverless = require('serverless-http');
module.exports = serverless(app);