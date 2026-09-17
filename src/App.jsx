import { useState, useEffect } from 'react';
import { useSpotifyTaste } from './hooks/useSpotifyTaste';
import Room from './components/Room';
import RoomLobby from './components/RoomLobby';
import { io } from 'socket.io-client';
import Game from './components/Game';
import PlayerSetup from './components/PlayerSetup';
import SpotifyPreviewPlayer from './components/SpotifyPreviewPlayer';
import WerewolfGame from './components/WerewolfGame';
import LandingPage from './components/LandingPage';
import Rankings from './components/Rankings';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8888';

function App() {
  const [accessToken, setAccessToken] = useState('');
  const [timeRange, setTimeRange] = useState('medium_term');
  const [roomCode, setRoomCode] = useState('');
  const [roomUsers, setRoomUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState('');
  const [databaseUserId, setDatabaseUserId] = useState('');
  const [showRoom, setShowRoom] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [roomPlayerName, setRoomPlayerName] = useState('');
  const [showPlayerSetup, setShowPlayerSetup] = useState(false);
  const [playerLeft, setPlayerLeft] = useState(null);
  const [nameTaken, setNameTaken] = useState(false);
  const [werewolfStarted, setWerewolfStarted] = useState(false);
  const [maxUsers, setMaxUsers] = useState(0);
  const [werewolfData, setWerewolfData] = useState(null);
  const [blendContext, setBlendContext] = useState('focus');
  const [blendHostId, setBlendHostId] = useState('');
  const [contextBlend, setContextBlend] = useState(null);
  const [blendError, setBlendError] = useState('');

  const {
    profile: userProfile,
    tracks: topTracks,
    artists: topArtists,
    blendCandidates,
    loading,
  } = useSpotifyTaste(accessToken, timeRange);

  console.log(
    topTracks.map((track) => ({
      name: track.name,
      preview_url: track.preview_url,
    }))
  );

  useEffect(() => {
    const newSocket = io(BACKEND_URL);

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
      setWerewolfStarted(false);
      setCurrentRound(null);
      setRoundResult(null);
    });

    // game-started listener
    newSocket.on('game-started', () => {
      setGameStarted(true);
    });

    newSocket.on('werewolf-started', (data) => {
      console.log('Werewolf started:', data);
      setWerewolfData(data);
      setWerewolfStarted(true);
    });

    newSocket.on('new-round', (round) => {
      console.log('New round:', round);
      setCurrentRound(round);
    });

    newSocket.on('round-result', (result) => {
      console.log('Round result:', result);
      setRoundResult(result);
    });

    newSocket.on('context-blend-ready', (blend) => {
      setContextBlend(blend);
      setBlendError('');
    });

    newSocket.on('blend-context-state', ({ context, hostId, blend }) => {
      setBlendContext(context || 'focus');
      setBlendHostId(hostId || '');
      setContextBlend(blend || null);
      setBlendError('');
    });

    newSocket.on('context-blend-error', ({ error }) => {
      setBlendError(error || 'Could not create blend');
    });

    newSocket.on('werewolf-ended', () => {
      setWerewolfStarted(false);
      setWerewolfData(null);
      setCurrentRound(null);
      setRoundResult(null);
    });

    newSocket.on('room-left', () => {
      setRoomCode('');
      setRoomUsers([]);
      setUserId('');
      setRoomPlayerName('');
      setShowPlayerSetup(false);
      setShowRoom(false);
      setActivePage('home');
      setGameStarted(false);
      setWerewolfStarted(false);
      setWerewolfData(null);
      setCurrentRound(null);
      setRoundResult(null);
      setBlendContext('focus');
      setBlendHostId('');
      setContextBlend(null);
      setBlendError('');
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
    if (!accessToken || !userProfile?.id) {
      return;
    }

    const syncUser = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spotifyId: userProfile.id,
            displayName: userProfile.display_name,
            avatarUrl: userProfile.images?.[0]?.url || null,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to sync user');
        }

        const data = await response.json();

        console.log('Database user:', data);

        setDatabaseUserId(data.userId);
      } catch (error) {
        console.error('User sync error:', error);
      }
    };

    syncUser();
  }, [accessToken, userProfile]);

  useEffect(() => {
    if (!socket || !roomCode || !userId || !roomPlayerName || showPlayerSetup) {
      return;
    }

    socket.emit('update-room-taste', {
      roomCode,
      userId,
      playerName: roomPlayerName,
      topArtists,
      topTracks,
      blendCandidates,
    });
  }, [socket, roomCode, userId, roomPlayerName, showPlayerSetup, topArtists, topTracks, blendCandidates]);

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
      setRoomPlayerName('');
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

  const handleLeaveRoom = () => {
    if (roomCode && userId) {
      socket?.emit('leave-room', { roomCode, userId });
      return;
    }

    setShowRoom(false);
  };

  const handleLogin = () => {
    // Redirect to /login in Backend
    window.location.href = `${BACKEND_URL}/login`;
  };

  const isInActiveGame = showRoom && (gameStarted || werewolfStarted);

  return (
    !accessToken ? (
      <LandingPage onLogin={handleLogin} />
    ) : (
    <div className="hs-app-shell min-h-screen w-full bg-black text-white flex flex-col items-center p-4 sm:p-6">
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

      {!isInActiveGame && <header className="hs-product-header">
        <button
          type="button"
          className="hs-product-brand"
          onClick={() => {
            setShowRoom(false);
            setActivePage('home');
          }}
          aria-label="Go to HarmonySync home"
        >
          <img src="/harmonysync-mark.png" alt="" />
          <span>HarmonySync</span>
        </button>

        <nav className="hs-product-nav" aria-label="HarmonySync pages">
          <button
            type="button"
            className={!showRoom && activePage === 'home' ? 'is-active' : ''}
            onClick={() => {
              setShowRoom(false);
              setActivePage('home');
            }}
          >
            Home
          </button>
          <button
            type="button"
            className={!showRoom && activePage === 'rankings' ? 'is-active' : ''}
            onClick={() => {
              setShowRoom(false);
              setActivePage('rankings');
            }}
          >
            Rankings
          </button>
          <button
            type="button"
            className={showRoom ? 'is-active' : ''}
            onClick={() => {
              setActivePage('home');
              setShowRoom(true);
            }}
          >
            Create room
          </button>
        </nav>

        <div className="hs-product-header__user">
          {userProfile?.display_name && <span>{userProfile.display_name}</span>}
          <button type="button" onClick={handleLogout}>Log out</button>
        </div>
      </header>}
      
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
        <div className={`hs-app-content w-full max-w-5xl ${showRoom ? 'hs-app-content--room' : 'hs-app-content--dashboard'}`}>
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
                      setRoomPlayerName(name);
                      setNameTaken(false);

                      socket.emit('join-room', {
                        roomCode,
                        userId,
                        databaseUserId,
                        playerName: name,
                        topArtists,
                        topTracks,
                        blendCandidates,
                      });
                    }}
                  />
                ) : (
                  werewolfStarted ? (
                    <WerewolfGame
                      socket={socket}
                      roomCode={roomCode}
                      userId={userId}
                      roomUsers={roomUsers}
                      werewolfData={werewolfData}
                    />

                  ) : gameStarted ? (
                    <Game round={currentRound} 
                      roundResult={roundResult}
                      roomUsers={roomUsers}
                      isHost={(roomUsers[0]?.id || blendHostId) === userId}
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

                      onEndGame={() => {
                        socket.emit('end-game', {
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
                      maxUsers={maxUsers}
                      isHost={(roomUsers[0]?.id || blendHostId) === userId}
                      selectedContext={blendContext}
                      onSelectContext={(context) => {
                        setBlendContext(context);
                        setContextBlend(null);
                        setBlendError('');
                        socket.emit('set-blend-context', {
                          roomCode,
                          userId,
                          context,
                        });
                      }}
                      blend={contextBlend}
                      blendError={blendError}
                      onLeaveRoom={handleLeaveRoom}
                      onStartGame={() => {
                        socket.emit('start-game', {
                          roomCode,
                        });
                      }}
                      onStartWerewolf={() => {
                        socket.emit('start-werewolf', {
                          roomCode,
                          userId,
                        });
                      }}
                      onChangeHost={(targetUserId) => {
                        socket.emit('change-host', {
                          roomCode,
                          userId,
                          targetUserId,
                        });
                      }}
                    />
                  )
                )
              ) : (
                // No room code
                <Room
                  onRoomJoined={(roomCode, userId, users, maxUsers) => {
                    setRoomCode(roomCode);
                    setRoomUsers(users);
                    setUserId(userId);
                    setMaxUsers(maxUsers);
                    setShowPlayerSetup(true);
                  }}
                />
              )}
            </>
          )}
          
          {/* Spotify Taste */}
          {!showRoom && (
            <div className="hs-dashboard">
              {activePage === 'rankings' ? (
                <Rankings />
              ) : (
                <>
                  {/* Home Hero */}
                  <section
                    className="hs-dashboard-hero"
                    aria-labelledby="home-hero-title"
                  >
                    <div className="hs-dashboard-hero__copy">
                      <h1 id="home-hero-title">
                        Make your taste <span>shared.</span>
                      </h1>

                      <p>
                        HarmonySync turns your Spotify rotation into a room for
                        discovery, playful competition, and the songs you have in
                        common.
                      </p>

                      <div
                        className="hs-dashboard-hero__traits"
                        aria-label="HarmonySync features"
                      >
                        <span><i /> Blend taste</span>
                        <span><i /> Play together</span>
                        <span><i /> Find the overlap</span>
                      </div>
                    </div>

                    <div className="hs-dashboard-signal" aria-hidden="true">
                      <span className="hs-dashboard-signal__ring hs-dashboard-signal__ring--outer" />
                      <span className="hs-dashboard-signal__ring hs-dashboard-signal__ring--inner" />
                      <span className="hs-dashboard-signal__beam" />

                      <div className="hs-dashboard-signal__core">
                        <img src="/harmonysync-mark.png" alt="" />
                      </div>

                      <span className="hs-dashboard-signal__label hs-dashboard-signal__label--top">
                        LIVE / SHARED
                      </span>

                      <span className="hs-dashboard-signal__label hs-dashboard-signal__label--bottom">
                        YOUR SIGNAL
                      </span>
                    </div>
                  </section>

                  {/* Create / Join Room */}
                  <button
                    onClick={() => setShowRoom(true)}
                    className="hs-dashboard-cta"
                  >
                    <span>
                      <i className="hs-dashboard-cta__dot" /> Create / Join Room
                    </span>

                    <span aria-hidden="true">↗</span>
                  </button>

                  {/* Top Tracks */}
                  <section className="hs-dashboard-section">
                    <div className="hs-dashboard-ranges">
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

                    <div className="hs-dashboard-heading">
                      <p className="hs-section-label">
                        01 / RECENT ROTATION
                      </p>
                      <h3>Top recent tracks</h3>
                    </div>

                    {loading ? (
                      <p className="text-slate-400 text-center py-4">
                        Waiting for Spotify...
                      </p>
                    ) : topTracks.length > 0 ? (
                      <SpotifyPreviewPlayer tracks={topTracks.slice(0, 5)} />
                    ) : (
                      <p className="text-slate-400 text-center py-4">
                        No Track Founded. Lose Your Vibe?
                      </p>
                    )}
                  </section>

                  {/* Top Artists */}
                  <section className="hs-dashboard-section hs-dashboard-section--artists">
                    <div className="hs-dashboard-heading">
                      <p className="hs-section-label">
                        02 / ARTIST SIGNAL
                      </p>
                      <h3>Top artists</h3>
                    </div>

                    {loading ? (
                      <p className="text-slate-400 text-center py-4">
                        Waiting for Spotify...
                      </p>
                    ) : topArtists.length > 0 ? (
                      <ul className="space-y-3">
                        {topArtists.map((artist, index) => (
                          <li
                            key={artist.id}
                            className="hs-dashboard-artist"
                          >
                            <span className="hs-dashboard-artist__rank">
                              {index + 1}
                            </span>

                            {artist.images?.[0]?.url && (
                              <img
                                src={artist.images[0].url}
                                alt=""
                                className="hs-dashboard-artist__image"
                              />
                            )}

                            <div className="hs-dashboard-artist__meta">
                              <a
                                href={artist.external_urls?.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hs-dashboard-artist__name"
                              >
                                {artist.name}
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-center py-4">
                        No artists found.
                      </p>
                    )}
                  </section>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
    )
  );
}

export default App;
