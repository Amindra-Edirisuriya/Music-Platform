const express = require('express');
const router = express.Router();
const {
  createPlaylist,
  getUserPlaylists,
  addSongToPlaylist,
  getMyPlaylists,
  updatePlaylist,
  deletePlaylist,
  removeSongFromPlaylist
} = require('../controllers/playlistController');
const { protect } = require('../Middleware/auth.js');

router.post('/', protect, createPlaylist);
router.get('/me', protect, getMyPlaylists);
router.get('/:userId', protect, getUserPlaylists);
router.put('/:id', protect, updatePlaylist);
router.delete('/:id', protect, deletePlaylist);
router.put('/:id/add', protect, addSongToPlaylist);
router.delete('/:id/songs/:songId', protect, removeSongFromPlaylist);

module.exports = router;
