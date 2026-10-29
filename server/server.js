require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads directory exists (lowercase for Linux compatibility)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Database Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/musicapp';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully via Mongoose'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Tip: Make sure your local MongoDB Community Server is running!');
  });

// Base Route
app.get('/', (req, res) => res.send('API running'));

// Routes
const authRoutes = require('./Routes/authRoutes');
const songRoutes = require('./Routes/songRoutes');
const playlistRoutes = require('./Routes/PlaylistRoutes');
const trackRoutes = require('./Routes/trackRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/tracks', trackRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);