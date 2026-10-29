import React from 'react';
import Logo from './Logo';

export default function Sidebar({ userRole, activeTab, setActiveTab }) {
  const navBtn = (tab, icon, label) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-3 ${
        activeTab === tab
          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent'
      }`}
    >
      <span className="text-base leading-none">{icon}</span> {label}
    </button>
  );

  return (
    <div className="w-64 h-full p-3 flex flex-col justify-between glass-card rounded-2xl space-y-4">
      {/* Logo block */}
      <div className="px-2 pt-1 pb-2">
        <Logo size="md" />
        <p className="text-[10px] text-zinc-500 mt-1.5 tracking-wide uppercase font-medium">
          Music Platform
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto scrollbar-none">
        {/* Main nav */}
        <div className="space-y-1">
          {navBtn('home', '🏠', 'Home')}
          {navBtn('trending', '🔥', 'Trending')}
        </div>

        {/* Library */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
              <span>📚</span> Your Library
            </span>
            <button
              onClick={() => setActiveTab('playlists')}
              className="text-zinc-500 hover:text-purple-400 text-sm font-bold bg-transparent border-0 transition-colors"
              title="Create Playlist"
            >
              ➕
            </button>
          </div>

          <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg space-y-2">
            <h4 className="text-[11px] font-bold text-white">Create your first playlist</h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              It&apos;s easy — we&apos;ll help you organize your favourite tracks.
            </p>
            <button
              onClick={() => setActiveTab('playlists')}
              className="px-3 py-1.5 bg-white text-black text-[10px] font-black rounded-full hover:scale-105 transition-transform"
            >
              Create Playlist
            </button>
          </div>

          {/* Artist-only uploader link */}
          {userRole === 'artist' && (
            <>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-3 ${
                  activeTab === 'catalog'
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <span>💿</span> My Catalog
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-3 ${
                  activeTab === 'upload'
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <span>📤</span> Studio Uploader
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom role badge */}
      <div className="p-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
          Network Node
        </span>
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-purple-950/50 text-purple-300 border border-purple-800/40 capitalize">
          {userRole || 'guest'}
        </span>
      </div>
    </div>
  );
}
