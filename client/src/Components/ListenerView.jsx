import React from 'react';
import Logo from './Logo';

export default function ListenerView({ activeTab, tracks, currentTrack, isPlaying, onPlayTrack }) {

  if (activeTab !== 'home' && activeTab !== 'trending') {
    return (
      <div className="text-zinc-500 text-xs p-6 italic glass-card rounded-xl">
        Switch to Home or Playlists to continue.
      </div>
    );
  }

  const TrackCard = ({ track, isCircle = false }) => {
    const isCurrent = currentTrack?._id === track._id;

    return (
      <div
        onClick={() => onPlayTrack(track)}
        className="group flex flex-col w-[160px] flex-shrink-0 cursor-pointer select-none"
      >
        <div
          className={`w-[160px] h-[160px] bg-zinc-900 overflow-hidden relative shadow-lg transition-all duration-300 border border-zinc-800 group-hover:border-purple-500/40 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] ${
            isCircle ? 'rounded-full' : 'rounded-xl'
          }`}
        >
          {track.imageUrl ? (
            <img
              src={track.imageUrl}
              alt={track.title}
              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-zinc-900 to-purple-950/40">
              🎵
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-11 h-11 bg-white text-black rounded-full flex items-center justify-center shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all font-bold text-lg">
              {isCurrent && isPlaying ? '⏸️' : '▶️'}
            </div>
          </div>
        </div>

        <div className={`mt-3 w-full ${isCircle ? 'text-center' : 'text-left'}`}>
          <h4
            className={`text-xs font-bold truncate px-1 ${
              isCurrent ? 'text-purple-400' : 'text-zinc-100'
            }`}
          >
            {track.title}
          </h4>
          <p className="text-[10px] text-zinc-500 truncate mt-0.5 uppercase tracking-wider px-1 font-medium">
            {track.artist?.name || track.artist || track.genre}
          </p>
        </div>
      </div>
    );
  };

  const ShelfRow = ({ title, tracksPool, isCircle = false }) => {
    if (!tracksPool || tracksPool.length === 0) return null;

    return (
      <div className="mb-10 w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black tracking-tight text-white">{title}</h2>
          <button className="text-[10px] font-black text-zinc-400 hover:text-purple-300 uppercase tracking-wider transition-colors">
            See All
          </button>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x">
          {tracksPool.map((track) => (
            <TrackCard key={track._id} track={track} isCircle={isCircle} />
          ))}
        </div>
      </div>
    );
  };

  // Search results (flat array)
  const isSearchResult = Array.isArray(tracks);

  if (isSearchResult) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h2 className="text-lg font-black text-white">Search Results</h2>
        <div className="flex gap-5 flex-wrap">
          {tracks.map((track) => (
            <TrackCard key={track._id} track={track} />
          ))}
          {tracks.length === 0 && (
            <p className="text-zinc-500 text-sm">No tracks found matching your search.</p>
          )}
        </div>
      </div>
    );
  }

  // Home / Trending view
  if (activeTab === 'trending') {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-xl font-black text-white">🔥 Trending Now</h2>
        <ShelfRow title="Global Hits" tracksPool={tracks.trending} />
        <ShelfRow title="Recommended" tracksPool={tracks.recommended} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero banner with logo */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-gradient-to-br from-purple-950/40 via-zinc-900/80 to-zinc-950 p-6 sm:p-8">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="logo-pulse">
            <Logo size="xl" showText={false} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome to <span className="text-purple-400">SoundSoul</span>
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400 max-w-lg leading-relaxed">
              Discover community uploads, trending global hits and Sinhala favourites.
              Create playlists and stream instantly.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30">
                Community
              </span>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                Trending
              </span>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                Sinhala
              </span>
            </div>
          </div>
        </div>
      </div>

      <ShelfRow title="🎵 Community Tracks" tracksPool={tracks.community} />
      <ShelfRow title="🔥 Trending Global Hits" tracksPool={tracks.trending} />
      <ShelfRow title="🇱🇰 Sinhala Songs" tracksPool={tracks.sinhala} />
      <ShelfRow title="⭐ Recommended For You" tracksPool={tracks.recommended} />
    </div>
  );
}