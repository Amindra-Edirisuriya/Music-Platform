import React, { useState, useEffect } from 'react';
import { fetchTracks } from './services/api';

import Sidebar from './Components/Sidebar';
import ArtistView from './Components/ArtistView';
import ListenerView from './Components/ListenerView';
import Register from './pages/Register';
import Logo from './Components/Logo';
import PlaylistView from './Components/PlaylistView';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSignUpDropdown, setShowSignUpDropdown] = useState(false);

  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState({
    community: [],
    trending: [],
    sinhala: [],
    recommended: [],
    all: []
  });
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());
  const [initialRegisterRole, setInitialRegisterRole] = useState('listener');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Apply dark / light theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#09090b' : '#f4f4f5');
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    if (token) {
      setUser({
        email: localStorage.getItem('userEmail') || 'User',
        role: localStorage.getItem('userRole') || 'listener'
      });
    } else {
      setUser(null);
    }
    loadTracks();
  }, [token]);

  useEffect(() => {
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      const idx = tracks.all.findIndex(t => t._id === currentTrack?._id);
      const next = tracks.all[idx + 1];
      if (next) handlePlayTrack(next);
      else setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audio, tracks.all, currentTrack]);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const loadTracks = async () => {
    try {
      let communityTracks = [];
      try {
        const res = await fetchTracks();
        if (res && res.data) {
          // FIXED: safe audio URL + populated artist name
          communityTracks = (Array.isArray(res.data) ? res.data : []).map(track => {
            const audioPath = (track.audioUrl || '').replace(/\\/g, '/').replace(/^\/+/, '');
            return {
              ...track,
              imageUrl: track.thumbnailPath
                ? `http://localhost:5000/${track.thumbnailPath}`
                : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300',
              audioUrl: audioPath.startsWith('http')
                ? audioPath
                : `http://localhost:5000/${audioPath}`,
              isInternational: false,
              category: 'community',
              artist: track.artist?.name || track.artist || 'Unknown Artist'
            };
          });
        }
      } catch (dbErr) {
        console.warn('Local backend unavailable.', dbErr);
      }

      const [trendingRes, sinhalaRes, recommendedRes] = await Promise.all([
        fetch('https://itunes.apple.com/search?term=top+hits+2025&media=music&limit=8&entity=song'),
        fetch('https://itunes.apple.com/search?term=sinhala+songs&media=music&limit=8&entity=song&country=LK'),
        fetch('https://itunes.apple.com/search?term=popular+hits&media=music&limit=8&entity=song')
      ]);

      const [trendingData, sinhalaData, recommendedData] = await Promise.all([
        trendingRes.json(),
        sinhalaRes.json(),
        recommendedRes.json()
      ]);

      const mapITunes = (results, category) =>
        results
          .map(item => ({
            _id: `itunes-${item.trackId}`,
            title: item.trackName,
            artist: item.artistName,
            genre: item.primaryGenreName,
            imageUrl: item.artworkUrl100?.replace('100x100', '300x300') || '',
            audioUrl: item.previewUrl || '',
            isInternational: true,
            category
          }))
          .filter(t => t.audioUrl);

      const trendingTracks = mapITunes(trendingData.results || [], 'trending');
      const sinhalaTracks = mapITunes(sinhalaData.results || [], 'sinhala');
      const recommendedTracks = mapITunes(recommendedData.results || [], 'recommended');

      setTracks({
        community: communityTracks,
        trending: trendingTracks,
        sinhala: sinhalaTracks,
        recommended: recommendedTracks,
        all: [...communityTracks, ...trendingTracks, ...sinhalaTracks, ...recommendedTracks]
      });
    } catch (err) {
      console.error('Error loading tracks:', err);
    }
  };

  const handlePlayTrack = (track) => {
    if (!token) {
      setInitialRegisterRole('listener');
      setCurrentView('register');
      return;
    }

    if (!track) return;

    if (currentTrack?._id === track._id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch(err => console.warn('Playback failed:', err));
        setIsPlaying(true);
      }
    } else {
      const src = track.audioUrl || '';
      if (!src) {
        console.warn('No audio URL for this track');
        return;
      }
      audio.src = src;
      audio
        .play()
        .then(() => {
          setCurrentTrack(track);
          setIsPlaying(true);
        })
        .catch(err => console.warn('Playback failed:', err));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setUser(null);
    audio.pause();
    setIsPlaying(false);
    setActiveTab('home');
    setCurrentView('dashboard');
  };

  const filteredTracks = tracks.all.filter(
    track =>
      track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(track.artist || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (currentView === 'login') {
    return (
      <div className="w-screen h-screen bg-soundsoul flex flex-col justify-center items-center p-4 gap-6">
        <Logo size="lg" className="logo-pulse" />
        <div className="w-full max-w-md bg-zinc-950/90 backdrop-blur border border-zinc-800 rounded-2xl p-8 relative shadow-2xl shadow-purple-950/20">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="absolute top-6 left-6 text-xs font-bold text-zinc-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
          >
            ← Back
          </button>
          <div className="pt-6">
            <Register
              setToken={(t) => {
                setToken(t);
                setCurrentView('dashboard');
              }}
              isLoginView={true}
              setIsLoginView={(val) => setCurrentView(val ? 'login' : 'register')}
              defaultRole="listener"
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'register') {
    return (
      <div className="w-screen h-screen bg-soundsoul flex flex-col justify-center items-center p-4 gap-6">
        <Logo size="lg" className="logo-pulse" />
        <div className="w-full max-w-md bg-zinc-950/90 backdrop-blur border border-zinc-800 rounded-2xl p-8 relative shadow-2xl shadow-purple-950/20">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="absolute top-6 left-6 text-xs font-bold text-zinc-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
          >
            ← Back
          </button>
          <div className="pt-6">
            <Register
              setToken={(t) => {
                setToken(t);
                setCurrentView('dashboard');
              }}
              isLoginView={false}
              setIsLoginView={(val) => setCurrentView(val ? 'login' : 'register')}
              defaultRole={initialRegisterRole}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-soundsoul text-white font-sans overflow-hidden select-none relative">
      <header className="h-16 px-6 flex justify-between items-center ss-header backdrop-blur-md border-b sticky top-0 z-30">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <Logo size="md" />
        </div>

        <div className="w-full max-w-md mx-4 relative group">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm group-focus-within:text-purple-400 transition-colors">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles or genres..."
            className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded-full py-2 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/70 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 relative">
          {!token ? (
            <>
              <button
                onClick={() => {
                  setCurrentView('login');
                  setShowSignUpDropdown(false);
                }}
                className="text-xs font-bold text-zinc-400 hover:text-white px-3 py-2 transition-colors"
              >
                Sign In
              </button>

              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="text-sm w-9 h-9 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center hover:border-purple-500/50 transition-all"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowSignUpDropdown(!showSignUpDropdown)}
                  className="text-xs font-bold bg-purple-600 text-white px-5 py-2 rounded-full hover:bg-purple-500 transition-all flex items-center gap-1"
                >
                  Sign Up <span className="text-[10px] opacity-80">{showSignUpDropdown ? '▲' : '▼'}</span>
                </button>

                {showSignUpDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSignUpDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50">
                      <button
                        onClick={() => {
                          setInitialRegisterRole('listener');
                          setCurrentView('register');
                          setShowSignUpDropdown(false);
                        }}
                        className="w-full text-left text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                      >
                        🎧 <span>Join as Listener</span>
                      </button>
                      <div className="h-px bg-zinc-900 my-1" />
                      <button
                        onClick={() => {
                          setInitialRegisterRole('artist');
                          setCurrentView('register');
                          setShowSignUpDropdown(false);
                        }}
                        className="w-full text-left text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                      >
                        🎸 <span>Join as Artist</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-400 font-medium hidden md:inline">
                Studio Node: <strong className="text-white">{user?.email}</strong>
              </span>
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="text-sm w-9 h-9 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center hover:border-purple-500/50 transition-all"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button
                onClick={handleLogout}
                className="text-xs bg-zinc-900 text-zinc-400 font-bold py-2 px-4 rounded-full border border-zinc-800 transition-all"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0 p-2 gap-2 pb-16 md:pb-2">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar userRole={user?.role || 'guest'} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="flex-1 bg-gradient-to-b from-zinc-900/40 to-transparent rounded-xl overflow-y-auto flex flex-col border border-zinc-800/40">
          <main className="p-4 sm:p-6 flex-1">
            {activeTab === 'playlists' ? (
              <PlaylistView
                token={token}
                allTracks={tracks.community}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
              />
            ) : user?.role === 'artist' && (activeTab === 'upload' || activeTab === 'catalog') ? (
              <ArtistView
                activeTab={activeTab}
                tracks={searchQuery ? filteredTracks : tracks.community}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
                refreshTracks={loadTracks}
              />
            ) : (
              <ListenerView
                activeTab={activeTab}
                tracks={searchQuery ? filteredTracks : tracks}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 ss-header backdrop-blur-md border-t px-2 py-1.5 flex items-center justify-around safe-area-pb">
        {[
          { tab: 'home', icon: '🏠', label: 'Home' },
          { tab: 'trending', icon: '🔥', label: 'Trending' },
          { tab: 'playlists', icon: '📚', label: 'Playlists' },
          ...(user?.role === 'artist'
            ? [
                { tab: 'catalog', icon: '💿', label: 'Studio' },
                { tab: 'upload', icon: '📤', label: 'Upload' },
              ]
            : []),
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px] ${
              activeTab === item.tab ? 'text-purple-400' : 'text-zinc-500'
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <footer className="h-20 sm:h-24 ss-player backdrop-blur-md border-t px-3 sm:px-6 flex items-center justify-between z-20 mb-14 md:mb-0">
        <div className="w-1/4 flex items-center gap-3">
          {currentTrack ? (
            <>
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden flex items-center justify-center text-sm">
                {currentTrack.imageUrl ? (
                  <img src={currentTrack.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  '🎵'
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
                <p className="text-[10px] text-zinc-500 truncate uppercase tracking-wider">
                  {currentTrack.artist?.name || currentTrack.artist || currentTrack.genre}
                </p>
              </div>
            </>
          ) : (
            <span className="text-[11px] text-zinc-600 italic">No audio track active</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 w-2/4 max-w-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const idx = tracks.all.findIndex(t => t._id === currentTrack?._id);
                const prev = tracks.all[idx - 1];
                if (prev) handlePlayTrack(prev);
              }}
              disabled={!currentTrack}
              className="text-zinc-400 hover:text-white transition disabled:opacity-30 text-lg"
            >
              ⏮️
            </button>

            <button
              onClick={() => currentTrack && handlePlayTrack(currentTrack)}
              disabled={!currentTrack}
              className="w-10 h-10 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow font-bold text-sm"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            <button
              onClick={() => {
                const idx = tracks.all.findIndex(t => t._id === currentTrack?._id);
                const next = tracks.all[idx + 1];
                if (next) handlePlayTrack(next);
              }}
              disabled={!currentTrack}
              className="text-zinc-400 hover:text-white transition disabled:opacity-30 text-lg"
            >
              ⏭️
            </button>
          </div>

          <div className="flex items-center gap-2 w-full">
            <span className="text-[10px] text-zinc-500 w-8 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => {
                audio.currentTime = Number(e.target.value);
                setCurrentTime(Number(e.target.value));
              }}
              className="flex-1 h-1 accent-purple-500 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-500 w-8">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="w-1/4 flex items-center justify-end gap-2">
          <span className="text-zinc-400 text-sm">🔊</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => {
              const val = Number(e.target.value);
              audio.volume = val;
              setVolume(val);
            }}
            className="w-24 h-1 accent-purple-500 cursor-pointer"
          />
        </div>
      </footer>
    </div>
  );
}