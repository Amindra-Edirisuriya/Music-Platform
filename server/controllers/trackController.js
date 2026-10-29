const Track = require('../Models/Track');
const path = require('path');
const fs = require('fs');

exports.uploadTrack = async (req, res) => {
  try {
    const { title, genre, accessMode } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an audio file' });
    }

    const relativePath = path.join('uploads', req.file.filename).replace(/\\/g, '/');

    const track = await Track.create({
      title,
      genre,
      accessMode: accessMode || 'open',
      audioUrl: relativePath,
      artist: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Track published successfully!',
      track
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllTracks = async (req, res) => {
  try {
    const tracks = await Track.find()
      .populate('artist', 'name email')
      .sort({ createdAt: -1 });
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getArtistTracks = async (req, res) => {
  try {
    const tracks = await Track.find({ artist: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tracks.length,
      tracks
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.updateTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    if (String(track.artist) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, genre, accessMode } = req.body;
    if (title !== undefined) track.title = title.trim();
    if (genre !== undefined) track.genre = genre;
    if (accessMode !== undefined) track.accessMode = accessMode;

    await track.save();
    res.status(200).json({ success: true, track });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    if (String(track.artist) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Remove file from disk if it exists
    if (track.audioUrl) {
      const filePath = path.join(__dirname, '..', track.audioUrl);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) { /* ignore */ }
      }
    }

    await track.deleteOne();
    res.status(200).json({ success: true, message: 'Track deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
