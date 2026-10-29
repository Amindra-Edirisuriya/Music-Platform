const Playlist = require('../Models/playlist');

exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Playlist name is required' });
    }

    const playlist = await Playlist.create({
      name: name.trim(),
      description: description || '',
      user: req.user._id,
      isPublic: !!isPublic,
      songs: []
    });

    res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id })
      .populate({ path: 'songs', populate: { path: 'artist', select: 'name email' } })
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: playlists.length, data: playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserPlaylists = async (req, res) => {
  try {
    const { userId } = req.params;

    const filter =
      String(userId) === String(req.user._id)
        ? { user: userId }
        : { user: userId, isPublic: true };

    const playlists = await Playlist.find(filter)
      .populate({ path: 'songs', populate: { path: 'artist', select: 'name email' } });
    res.status(200).json({ success: true, count: playlists.length, data: playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    if (String(playlist.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { name, description, isPublic } = req.body;
    if (name !== undefined) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = !!isPublic;

    await playlist.save();
    await playlist.populate({ path: 'songs', populate: { path: 'artist', select: 'name email' } });
    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    if (String(playlist.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await playlist.deleteOne();
    res.status(200).json({ success: true, message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addSongToPlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ success: false, message: 'songId is required' });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    if (String(playlist.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this playlist' });
    }
    if (playlist.songs.some((id) => String(id) === String(songId))) {
      return res.status(400).json({ success: false, message: 'Song already exists in this playlist' });
    }

    playlist.songs.push(songId);
    await playlist.save();
    await playlist.populate({ path: 'songs', populate: { path: 'artist', select: 'name email' } });

    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const { id, songId } = req.params;
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    if (String(playlist.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    playlist.songs = playlist.songs.filter((sid) => String(sid) !== String(songId));
    await playlist.save();
    await playlist.populate({ path: 'songs', populate: { path: 'artist', select: 'name email' } });

    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
