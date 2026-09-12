import { useState, useEffect } from 'react';

import { useSpotifyTaste } from './hooks/useSpotifyTaste';

import { findSharedArtists } from './utils/tasteProfile';

import Room from './components/Room';

import RoomLobby from './components/RoomLobby';

import { io } from 'socket.io-client';

function App() {
  const [accessToken, setAccessToken] = useState('');
  const [timeRange, setTimeRange] = useState('medium_term');
  const [roomCode, setRoomCode] = useState('');
  const [roomUsers, setRoomUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  
  const {
    profile: userProfile,
    tracks: topTracks,
    artists: topArtists,
    loading,
    error,
  } = useSpotifyTaste(accessToken, timeRange);

  useEffect(() => {
    const newSocket = io('http://127.0.0.1:8888');

    newSocket.on('room-users', (users) => {
      setRoomUsers(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Receive Token from URL after Spotify redirect to frontend
    const query = new URLSearchParams(window.location.search);
    const token = query.get('access_token');

    // Access token and save to localStorage in case there is no access_token on the URL
    if (token) {
      setAccessToken(token);
      // Temporarily save access token to localStorage
      localStorage.setItem('spotify_token', token);
      
      // Format URL
      window.history.pushState({}, null, '/');
    } else {
      // Access to token saved before
      const savedToken = localStorage.getItem('spotify_token');
      if (savedToken) setAccessToken(savedToken);
    }
  }, []);

  const handleLogout = () => {
    setAccessToken('');
    localStorage.removeItem('spotify_token');
  }

  const handleLogin = () => {
    // Redirect to /login in Backend
    window.location.href = 'http://127.0.0.1:8888/login';
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6 text-green-500">HarmonySync</h1>
      
      {!accessToken ? (
        <div className="text-center">
          <p className="mb-6 text-gray-400">Log in with Spotify to fully experience HarmonySync.</p>
          <button
            onClick={handleLogin}
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded-full transition duration-300"
          >
            Log in with Spotify
          </button>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-slate-800 p-6 rounded-2xl shadow-xl">
          {roomCode ? (
            <RoomLobby
              roomCode={roomCode}
              users={roomUsers}
            />
          ) : (
            <Room
              onRoomJoined={(roomCode, users) => {
                setRoomCode(roomCode);
                setRoomUsers(users);

                socket.emit('join-room', roomCode);
              }}
            />
          )}
          {/* User Profile */}
          {userProfile && (
            <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
              <div className="flex items-center space-x-4">
                {userProfile.images?.[0]?.url && (
                  <img
                    src={userProfile.images[0].url}
                    alt="Avatar"
                    className="w-14 h-14 rounded-full border-2 border-green-400 object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-bold">{userProfile.display_name}</h2>
                  <p className="text-sm text-slate-400">{userProfile.email} • {userProfile.product} plan</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-sm px-4 py-2 rounded-lg transition"
              >
                Log out
              </button>
            </div>
          )}

          {/* Top Tracks */}
          <div>
            <div className="flex gap-2 mb-4">
              {[
                { value: 'short_term', label: '4 Weeks' },
                { value: 'medium_term', label: '6 Months' },
                { value: 'long_term', label: '1 Year' },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    timeRange === range.value
                      ? 'bg-green-500 text-black'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <h3 className="text-lg font-semibold mb-4 text-green-300">🎵 Top 5 Recent Tracks </h3>

            {loading ? (
              <p className="text-slate-400 text-center py-4">Waiting for Spotify...</p>
            ) : topTracks.length > 0 ? (
              <ul className="space-y-3">
                {topTracks.map((track, index) => (
                  <li 
                    key={track.id} 
                    className="flex items-center justify-between bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition">
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-400 font-bold w-4">
                        {index + 1}
                      </span>

                      {track.album?.images?.[0]?.url && (
                        <img 
                          src={track.album.images[0].url} 
                          alt="" 
                          className="w-10 h-10 rounded object-cover" />
                      )}
                      <div>
                        <p className="font-semibold text-sm line-clamp-1">{track.name}</p>
                        <p className="text-xs text-slate-400">{track.artists.map(a => a.name).join(', ')}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 text-center py-4">No Track Founded. Lose Your Vibe?</p>
            )}
          </div>

          {/* Top Artists */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-green-300"> 🎤 Top 5 Artists </h3>

            {loading ? (
              <p className="text-slate-400 text-center py-4"> Waiting for Spotify... </p>
            ) : topArtists.length > 0 ? (
              <ul className="space-y-3">
                {topArtists.map((artist, index) => (
                  <li
                    key={artist.id}
                    className="flex items-center bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition">
                    <span className="text-slate-400 font-bold w-6">
                      {index + 1}
                    </span>

                    {artist.images?.[0]?.url && (
                      <img
                        src={artist.images[0].url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                    )}

                    <div>
                      <p className="font-semibold text-sm">
                        {artist.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {artist.genres?.slice(0, 3).join(', ') || 'No genre data'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 text-center py-4">
                No artists found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;