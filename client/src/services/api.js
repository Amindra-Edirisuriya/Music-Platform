import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const loginUser = (formData) => API.post('/auth/login', formData);
export const registerUser = (formData) => API.post('/auth/register', formData);

// Tracks
export const fetchTracks = () => API.get('/tracks');
export const fetchMyCatalog = () => API.get('/tracks/my-catalog');
export const uploadTrackFile = (formData) =>
  API.post('/tracks/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const updateTrack = (id, data) => API.put(`/tracks/${id}`, data);
export const deleteTrack = (id) => API.delete(`/tracks/${id}`);

// Playlists
export const createPlaylist = (data) => API.post('/playlists', data);
export const fetchMyPlaylists = () => API.get('/playlists/me');
export const fetchUserPlaylists = (userId) => API.get(`/playlists/${userId}`);
export const updatePlaylist = (id, data) => API.put(`/playlists/${id}`, data);
export const deletePlaylist = (id) => API.delete(`/playlists/${id}`);
export const addSongToPlaylist = (playlistId, songId) =>
  API.put(`/playlists/${playlistId}/add`, { songId });
export const removeSongFromPlaylist = (playlistId, songId) =>
  API.delete(`/playlists/${playlistId}/songs/${songId}`);
