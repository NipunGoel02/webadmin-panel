require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment variables');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: '*', // Allow all origins (adjust in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Scheme Model
const Scheme = mongoose.model('Scheme', new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageLink: { type: String },
  pdfLink: { type: String },
  income: { type: Number },
  state: { type: String },
  age: { type: Number },
  eligibility: Object,
  benefits: Array,
  lastUpdated: { type: Date, default: Date.now }
}));

// API Routes
app.post('/api/schemes', async (req, res) => {
  try {
    const scheme = new Scheme(req.body);
    await scheme.save();
    res.status(201).send(scheme);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/api/schemes', async (req, res) => {
  try {
    const schemes = await Scheme.find();
    res.send(schemes);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.put('/api/schemes/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!scheme) return res.status(404).send('Scheme not found');
    res.send(scheme);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete('/api/schemes/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);
    if (!scheme) return res.status(404).send('Scheme not found');
    res.send(scheme);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Start Server
const PORT = process.env.PORT || 3001;

// Error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
