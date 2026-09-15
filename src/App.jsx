import { useState, useEffect } from 'react';
import { useSpotifyTaste } from './hooks/useSpotifyTaste';
import Room from './components/Room';
import RoomLobby from './components/RoomLobby';
import { io } from 'socket.io-client';
import Game from './components/Game';
import PlayerSetup from './components/PlayerSetup';
import SpotifyPreviewPlayer from './components/SpotifyPreviewPlayer';

function App() {
  const [accessToken, setAccessToken] = useState('');
  const [timeRange, setTimeRange] = useState('medium_term');
  const [roomCode, setRoomCode] = useState('');
  const [roomUsers, setRoomUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState('');
  const [showRoom, setShowRoom] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [showPlayerSetup, setShowPlayerSetup] = useState(false);
  const [playerLeft, setPlayerLeft] = useState(null);
  const [nameTaken, setNameTaken] = useState(false);

  const {
    profile: userProfile,
    tracks: topTracks,
    artists: topArtists,
    loading,
    error,
  } = useSpotifyTaste(accessToken, timeRange);

  console.log(
    topTracks.map((track) => ({
      name: track.name,
      preview_url: track.preview_url,
    }))
  );

  useEffect(() => {
    const newSocket = io('http://127.0.0.1:8888');

    // room-users listener
    newSocket.on('room-users', (users) => {
      console.log('Room users:', users);
      setRoomUsers(users);
    });

    newSocket.on('player-left', ({ playerName, userId: leavingUserId }) => {
      setPlayerLeft({
        playerName,
        userId: leavingUserId,
      });       
    });

    newSocket.on('name-taken', () => {
      setNameTaken(true);
    });

    newSocket.on('join-room-success', () => {
      setNameTaken(false);
      setShowPlayerSetup(false);
    });

    newSocket.on('game-ended', () => {
      setGameStarted(false);
      setCurrentRound(null);
      setRoundResult(null);
    });

    // game-started listener
    newSocket.on('game-started', () => {
      setGameStarted(true);
    });

    newSocket.on('new-round', (round) => {
      console.log('New round:', round);
      setCurrentRound(round);
    });

    newSocket.on('round-result', (result) => {
      console.log('Round result:', result);
      setRoundResult(result);
    });

    newSocket.on('answer-result', (result) => {
      setAnswerResult(result);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
  }, [roomUsers, userId]);

  useEffect(() => {
    // Receive Token from URL after Spotify redirect to frontend
    const query = new URLSearchParams(window.location.search);
    const token = query.get('access_token');
    const refreshToken = query.get('refresh_token');

    // Access token and save to localStorage in case there is no access_token on the URL
    if (token) {
      setAccessToken(token);
      // Temporarily save access token to localStorage
      localStorage.setItem('spotify_token', token);

      // Save refresh token
      if (refreshToken) {
        localStorage.setItem('spotify_refresh_token', refreshToken);
      }
      
      // Format URL
      window.history.pushState({}, null, '/');
    } else {
      // Access to token saved before
      const savedToken = localStorage.getItem('spotify_token');
      if (savedToken) setAccessToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!playerLeft) {
      return;
    }

    const timer = setTimeout(() => {
      const isMe = playerLeft.userId === userId;

      setPlayerLeft(null);

      if (isMe) {
        setRoomCode('');
        setRoomUsers([]);
        setUserId('');
        setGameStarted(false);
        setCurrentRound(null);
        setRoundResult(null);
        setShowRoom(false);
      } else {
        setRoundResult(null);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [playerLeft, userId]);

  const handleLogout = () => {
    setAccessToken('');
    localStorage.removeItem('spotify_token');
  }

  const handleLogin = () => {
    // Redirect to /login in Backend
    window.location.href = 'http://127.0.0.1:8888/login';
  };


  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center p-4 sm:p-6">
      {playerLeft && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-black px-8 py-6 rounded-2xl shadow-2xl text-center">
            <h2 className="text-2xl font-bold">
              {playerLeft.userId === userId
                ? '👋 You left the room'
                : `👋 ${playerLeft.playerName} left the room`}
            </h2>
          </div>
        </div>
      )}

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
        <div className="w-full max-w-5xl bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
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

          {/* Show Room Pages */}
          {showRoom && (
            <>
              {roomCode ? (
                // Have room code
                showPlayerSetup ? (
                  <PlayerSetup
                    nameTaken={nameTaken}
                    onNameChange={() => setNameTaken(false)}
                    onContinue={(name) => {
                      setPlayerName(name);
                      setNameTaken(false);

                      socket.emit('join-room', {
                        roomCode,
                        userId,
                        playerName: name,
                        topArtists,
                        topTracks,
                      });
                    }}
                  />
                ) : (
                  gameStarted ? (
                    <Game round={currentRound} 
                      roundResult={roundResult}
                      roomUsers={roomUsers}
                      onAnswer={(selectedUserId) => {
                        socket.emit('submit-answer', {
                          roomCode,
                          userId,
                          selectedUserId,
                        });
                      }}

                      onNextRound={() => {
                        setRoundResult(null);

                        socket.emit('next-round', {
                          roomCode,
                          userId,
                        });
                      }}

                      onQuit={() => {
                        socket.emit('quit-game', {
                          roomCode,
                          userId,
                        });
                      }}
                    />
                  ) : (
                    <RoomLobby
                      roomCode={roomCode}
                      users={roomUsers}
                      isHost={roomUsers[0]?.id === userId}
                      onStartGame={() => {
                        socket.emit('start-game', {
                          roomCode,
                        });
                      }}
                    />
                  )
                )
              ) : (
                // No room code
                <Room
                  onRoomJoined={(roomCode, userId, users) => {
                    setRoomCode(roomCode);
                    setRoomUsers(users);
                    setUserId(userId);
                    setShowPlayerSetup(true);
                  }}
                />
              )}
            </>
          )}
          
          {/* Spotify Taste */}
          {!showRoom && ( 
            <>
              {/* Show Room Button */}
              <button
                onClick={() => setShowRoom(true)}
                className="w-full mb-6 bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-6 rounded-xl transition"
              >
                🎧 Create / Join Room
              </button>

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
                  <SpotifyPreviewPlayer tracks={topTracks.slice(0, 5)} />
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
                        className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition">
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

                        <div className="min-w-0">
                          <a
                            href={artist.external_urls?.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-sm truncate hover:text-green-400 transition block"
                          >
                            {artist.name}
                          </a>

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
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;