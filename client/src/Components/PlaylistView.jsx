import React, { useState, useEffect } from 'react';
import {
  createPlaylist,
  fetchMyPlaylists,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
} from '../services/api';

export default function PlaylistView({
  token,
  allTracks = [],
  currentTrack,
  isPlaying,
  onPlayTrack
}) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', isPublic: false });
  const [editingId, setEditingId] = useState(null);
  const [addTrackId, setAddTrackId] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetchMyPlaylists();
      setPlaylists(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      await createPlaylist(form);
      setForm({ name: '', description: '', isPublic: false });
      setShowCreate(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setBusy(true);
    try {
      await updatePlaylist(editingId, form);
      setEditingId(null);
      setForm({ name: '', description: '', isPublic: false });
      await load();
      if (selected?._id === editingId) {
        const refreshed = (await fetchMyPlaylists()).data?.data || [];
        setSelected(refreshed.find((p) => p._id === editingId) || null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this playlist permanently?')) return;
    setBusy(true);
    try {
      await deletePlaylist(id);
      if (selected?._id === id) setSelected(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  const handleAddTrack = async () => {
    if (!selected || !addTrackId) return;
    setBusy(true);
    try {
      const res = await addSongToPlaylist(selected._id, addTrackId);
      setSelected(res.data.data);
      setAddTrackId('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add track');
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveTrack = async (songId) => {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await removeSongFromPlaylist(selected._id, songId);
      setSelected(res.data.data);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove track');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (pl) => {
    setEditingId(pl._id);
    setForm({
      name: pl.name,
      description: pl.description || '',
      isPublic: !!pl.isPublic
    });
    setShowCreate(false);
  };

  if (!token) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-zinc-400 text-sm">Sign in to create and manage playlists.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white">Your Playlists</h2>
          <p className="text-zinc-400 text-xs mt-0.5">Create, edit, and organize your music collections</p>
        </div>
        <button
          onClick={() => {
            setShowCreate(true);
            setEditingId(null);
            setForm({ name: '', description: '', isPublic: false });
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-full transition-all"
        >
          + New Playlist
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-xs">
          {error}
          <button onClick={() => setError('')} className="ml-3 underline">dismiss</button>
        </div>
      )}

      {/* Create / Edit form */}
      {(showCreate || editingId) && (
        <form
          onSubmit={editingId ? handleUpdate : handleCreate}
          className="glass-card rounded-2xl p-5 space-y-3 border border-purple-500/20"
        >
          <h3 className="text-sm font-bold text-white">
            {editingId ? 'Edit Playlist' : 'Create Playlist'}
          </h3>
          <input
            type="text"
            placeholder="Playlist name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
          />
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              className="accent-purple-500"
            />
            Make public
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg"
            >
              {busy ? 'Saving…' : editingId ? 'Save Changes' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setEditingId(null);
              }}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading playlists…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {playlists.length === 0 && (
              <div className="glass-card rounded-xl p-6 text-center text-zinc-500 text-xs">
                No playlists yet. Create your first one!
              </div>
            )}
            {playlists.map((pl) => (
              <div
                key={pl._id}
                onClick={() => setSelected(pl)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selected?._id === pl._id
                    ? 'bg-purple-950/30 border-purple-500/40'
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{pl.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {pl.songs?.length || 0} tracks · {pl.isPublic ? 'Public' : 'Private'}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => startEdit(pl)}
                      className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(pl._id)}
                      className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-red-400 hover:bg-red-950/50"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3 glass-card rounded-2xl p-5 min-h-[280px]">
            {!selected ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                Select a playlist to view & manage tracks
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white">{selected.name}</h3>
                  {selected.description && (
                    <p className="text-xs text-zinc-400 mt-1">{selected.description}</p>
                  )}
                </div>

                {/* Add track */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={addTrackId}
                    onChange={(e) => setAddTrackId(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Add a community track…</option>
                    {(allTracks || []).map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title} — {t.artist?.name || t.genre || 'Unknown'}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddTrack}
                    disabled={!addTrackId || busy}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg whitespace-nowrap"
                  >
                    Add Track
                  </button>
                </div>

                {/* Songs list */}
                <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
                  {(selected.songs || []).length === 0 && (
                    <p className="p-4 text-zinc-500 text-xs text-center">No tracks in this playlist yet</p>
                  )}
                  {(selected.songs || []).map((song, idx) => {
                    if (!song || typeof song === 'string') {
                      return (
                        <div key={idx} className="px-4 py-3 text-xs text-zinc-500">
                          Track ID: {String(song)}
                        </div>
                      );
                    }
                    const isCurrent = currentTrack?._id === song._id;
                    return (
                      <div
                        key={song._id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900/50 transition-colors"
                      >
                        <span className="text-zinc-600 text-[10px] w-5">{idx + 1}</span>
                        <button
                          onClick={() => onPlayTrack?.(song)}
                          className="text-sm w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-purple-600 transition-colors"
                        >
                          {isCurrent && isPlaying ? '⏸️' : '▶️'}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${isCurrent ? 'text-purple-400' : 'text-white'}`}>
                            {song.title}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">
                            {song.artist?.name || song.genre || '—'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveTrack(song._id)}
                          className="text-[10px] text-zinc-500 hover:text-red-400 px-2"
                          title="Remove from playlist"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
