import { useEffect, useState } from 'react';

const PHASE_LABELS = {
  waiting: 'Waiting room',
  clue: 'Clue transmission',
  'clue-submitted': 'Signal received',
  voting: 'Vote in progress',
  'voting-results': 'Vote resolved',
  spectating: 'Spectator mode',
  'imposter-guess': 'Final guess',
  finished: 'Round complete',
};

const DEFAULT_VOTING_SECONDS = 30;

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M6 3h7v7" /></svg>
);

const PulseGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h4l2-6 4 12 2-6h6" /></svg>
);

const WerewolfGame = ({
  socket,
  roomCode,
  userId,
  roomUsers,
  werewolfData,
}) => {
  const [role, setRole] = useState(null);
  const [song, setSong] = useState(null);
  const [phase, setPhase] = useState('waiting');
  const [clue, setClue] = useState('');
  const [clues, setClues] = useState([]);
  const [selectedVote, setSelectedVote] = useState(null);
  const [votingResults, setVotingResults] = useState(null);
  const [finalGuess, setFinalGuess] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [eliminatedPlayers, setEliminatedPlayers] = useState([]);
  const [votingDuration, setVotingDuration] = useState(DEFAULT_VOTING_SECONDS);
  const [votingTimeLeft, setVotingTimeLeft] = useState(0);
  const [restarting, setRestarting] = useState(false);

  const isHost = roomUsers[0]?.id === userId;

    useEffect(() => {
        if (!socket) {
            return;
        }

        const handleImposterGuessStart = () => {
            setPhase('imposter-guess');
        };

        const handleVotingStart = ({ clues, durationSeconds }) => {
            setClues(clues);
            const duration = Number(durationSeconds) || DEFAULT_VOTING_SECONDS;
            setVotingDuration(duration);
            setVotingTimeLeft(duration);

            if (eliminatedPlayers.includes(userId)) {
            setPhase('spectating');
            return;
            }

            setPhase('voting');
        };

        const handleGameResult = (result) => {
            setGameResult(result);
            setRestarting(false);
            setPhase('finished');
        };

        const handleVotingResults = (result) => {
            setVotingResults(result);

            if (
                !result.isTie &&
                !result.isImposter &&
                result.eliminatedPlayer?.userId
            ) {
            setEliminatedPlayers((prev) => [
                ...prev,
                result.eliminatedPlayer.userId,
            ]);
            }

            setPhase('voting-results');
        };

        const handleNewClueRound = () => {
            setClue('');
            setSelectedVote(null);
            setClues([]);
            setVotingResults(null);
            setVotingTimeLeft(0);

            if (eliminatedPlayers.includes(userId)) {
            setPhase('spectating');
            } else {
            setPhase('clue');
            }
        };

        socket.on('werewolf-voting-start', handleVotingStart);
        socket.on('werewolf-game-result', handleGameResult);
        socket.on('werewolf-voting-results', handleVotingResults);
        socket.on('werewolf-new-clue-round', handleNewClueRound);
        socket.on(
            'werewolf-imposter-guess-start',
            handleImposterGuessStart
        );

        return () => {
            socket.off('werewolf-voting-start', handleVotingStart);
            socket.off('werewolf-game-result', handleGameResult);
            socket.off('werewolf-voting-results', handleVotingResults);
            socket.off('werewolf-new-clue-round', handleNewClueRound);
            socket.off(
                'werewolf-imposter-guess-start',
                handleImposterGuessStart
            );
        };
    }, [socket, userId, eliminatedPlayers]);

    useEffect(() => {
        if (phase !== 'voting') {
            setVotingTimeLeft(0);
            return undefined;
        }

        const timer = window.setInterval(() => {
            setVotingTimeLeft((current) => Math.max(0, current - 1));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [phase, votingDuration]);

    useEffect(() => {
        if (!werewolfData) {
            return;
        }

        setRole(werewolfData.role);
        setSong(werewolfData.song);
        setClue('');
        setClues([]);
        setSelectedVote(null);
        setVotingResults(null);
        setFinalGuess(null);
        setGameResult(null);
        setEliminatedPlayers([]);
        setVotingTimeLeft(0);
        setRestarting(false);
        setPhase('clue');
    }, [werewolfData]);

  const handlePlayAgain = () => {
    if (!isHost || restarting) {
      return;
    }

    setRestarting(true);
    socket.emit('restart-werewolf', { roomCode, userId });
  };

  const handleEndGame = () => {
    if (!isHost) {
      return;
    }

    socket.emit('end-werewolf', { roomCode, userId });
  };

  const handleLeaveGame = () => {
    if (isHost) {
      return;
    }

    socket.emit('leave-werewolf', { roomCode, userId });
  };

  const votingProgress = votingDuration > 0
    ? Math.max(0, Math.min(100, (votingTimeLeft / votingDuration) * 100))
    : 0;

  return (
    <div className="hs-werewolf-shell min-h-screen text-white">
      <div className="hs-werewolf-frame">
        <header className="hs-werewolf-header">
          <div className="hs-eyebrow"><span className="hs-live-dot" /> ROOM {roomCode} / SOCIAL GAME</div>
          <div className="hs-werewolf-title-row">
            <div>
              <h1 className="hs-werewolf-title">Music Werewolf</h1>
              <p className="hs-werewolf-subtitle">Read the room. Follow the clues. Protect your taste.</p>
            </div>
            <div className="hs-werewolf-header__actions">
              <div className="hs-phase-beacon">
                <span>LIVE PHASE</span>
                <strong>{PHASE_LABELS[phase] || phase}</strong>
                <i><PulseGlyph /></i>
              </div>
              {isHost ? (
                <button
                  type="button"
                  onClick={handleEndGame}
                  className="hs-werewolf-game-action hs-werewolf-game-action--end"
                >
                  End Game
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLeaveGame}
                  className="hs-werewolf-game-action hs-werewolf-game-action--leave"
                >
                  Leave Game
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="hs-werewolf-layout">
          <aside className="hs-werewolf-rail" aria-label="Game telemetry">
            <div className="hs-werewolf-radar" aria-hidden="true">
              <span className="hs-werewolf-radar__ring hs-werewolf-radar__ring--one" />
              <span className="hs-werewolf-radar__ring hs-werewolf-radar__ring--two" />
              <span className="hs-werewolf-radar__sweep" />
              <span className="hs-werewolf-radar__core" />
            </div>
            <div className="hs-werewolf-rail__meta">
              <span>ROOM SIGNAL</span>
              <strong>{roomUsers.length} players connected</strong>
            </div>
            <div className="hs-werewolf-roster">
              <div className="hs-werewolf-roster__heading"><span>PLAYERS</span><b>{roomUsers.length}</b></div>
              {roomUsers.map((user, index) => {
                const eliminated = eliminatedPlayers.includes(user.id);
                return (
                  <div key={user.id} className={`hs-werewolf-roster__row ${eliminated ? 'is-eliminated' : ''}`}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{user.playerName}</strong>
                    <i aria-label={eliminated ? 'Eliminated' : 'Active'} />
                  </div>
                );
              })}
            </div>
            <div className="hs-werewolf-rail__footer">
              <span className="hs-live-dot" />
              <span>{isHost ? 'You are the host' : 'Host is running the room'}</span>
            </div>
          </aside>

          <main className="hs-werewolf-stage">
            {role && song && phase !== 'waiting' && (
              <section className="hs-werewolf-songline" aria-label="Your secret song">
                <div className="hs-werewolf-role-lockup">
                  <p className="hs-section-label">YOUR ROLE</p>
                  <strong>{role === 'imposter' ? 'Imposter' : 'Listener'}</strong>
                  <span>{role === 'imposter' ? 'Your track is the decoy.' : 'Guard the real track.'}</span>
                </div>
                <div className="hs-werewolf-cover-wrap">
                  <span className="hs-werewolf-cover-ring" aria-hidden="true" />
                  <img src={song.image} alt={song.name} />
                </div>
                <div className="hs-werewolf-song-meta">
                  <p className="hs-section-label">SECRET TRACK</p>
                  <h2>{song.name}</h2>
                  <p>{song.artist}</p>
                </div>
              </section>
            )}

            <div className="hs-werewolf-stage-content">
              {phase === 'waiting' && (
                <section className="hs-werewolf-panel hs-werewolf-panel--empty">
                  <span className="hs-panel-index">00</span>
                  <h2>Waiting for the room signal</h2>
                  <p>The host is preparing the first track. Stay close.</p>
                </section>
              )}

              {phase === 'clue' && (
                <section className="hs-werewolf-panel">
                  <div className="hs-werewolf-panel-heading">
                    <span className="hs-panel-index">01</span>
                    <div><p className="hs-section-label">CLUE TRANSMISSION</p><h2>Give one clue</h2></div>
                  </div>
                  <p className="hs-werewolf-panel-copy">Describe your song without saying the song or artist. Make the room feel it.</p>
                  <form onSubmit={(event) => {
                    event.preventDefault();
                    if (!clue.trim()) return;
                    socket.emit('submit-werewolf-clue', { roomCode, userId, clue });
                    setPhase('clue-submitted');
                  }}>
                    <input value={clue} onChange={(event) => setClue(event.target.value)} placeholder="Transmit a clue…" />
                    <button type="submit" disabled={!clue.trim()} className="hs-werewolf-submit">
                      <span>Submit clue</span><ArrowIcon />
                    </button>
                  </form>
                </section>
              )}

              {phase === 'clue-submitted' && (
                <section className="hs-werewolf-panel hs-werewolf-panel--waiting">
                  <span className="hs-panel-index">01</span>
                  <h2>Clue transmitted</h2>
                  <p>Waiting for every active player to send their signal.</p>
                  <div className="hs-werewolf-scanline" aria-hidden="true" />
                </section>
              )}

              {phase === 'voting' && !eliminatedPlayers.includes(userId) && (
                <section className="hs-werewolf-panel hs-werewolf-panel--voting">
                  <div className="hs-werewolf-panel-heading hs-werewolf-panel-heading--voting">
                    <div><p className="hs-section-label">02 / ROOM DECISION</p><h2>Who is the Imposter?</h2></div>
                    <div className={`hs-werewolf-vote-timer ${votingTimeLeft <= 8 ? 'is-urgent' : ''}`} aria-live="polite">
                      <strong>{votingTimeLeft}s</strong><span>to vote</span><i><b style={{ width: `${votingProgress}%` }} /></i>
                    </div>
                  </div>
                  <div className="hs-werewolf-clues">
                    {clues.map((player) => (
                      <article key={player.userId} className="hs-clue-card">
                        <span>{player.playerName}</span>
                        <p>“{player.clue}”</p>
                      </article>
                    ))}
                  </div>
                  <div className="hs-werewolf-vote-list">
                    {roomUsers.filter((user) => !eliminatedPlayers.includes(user.id)).map((user) => (
                      <button key={user.id} disabled={selectedVote !== null || votingTimeLeft === 0} onClick={() => {
                        setSelectedVote(user.id);
                        socket.emit('submit-werewolf-vote', { roomCode, userId, votedUserId: user.id });
                      }} className={selectedVote === user.id ? 'is-selected' : ''}>
                        <span>{user.playerName}</span><ArrowIcon />
                      </button>
                    ))}
                  </div>
                  <p className="hs-werewolf-status">{votingTimeLeft === 0 ? 'Voting window closed. Tallying the room…' : selectedVote ? 'Vote submitted. Waiting for the room…' : 'Choose the player whose clue does not belong.'}</p>
                </section>
              )}

              {phase === 'voting' && eliminatedPlayers.includes(userId) && (
                <section className="hs-werewolf-panel hs-werewolf-panel--empty">
                  <span className="hs-panel-index">02</span>
                  <h2>Watching the vote</h2>
                  <p>You are eliminated, so the remaining players will decide the next signal.</p>
                </section>
              )}

              {phase === 'voting-results' && votingResults && (
                <section className={`hs-werewolf-panel hs-werewolf-panel--result ${votingResults.isTie ? 'is-tie' : votingResults.isImposter ? 'is-correct' : 'is-wrong'}`}>
                  <p className="hs-section-label">03 / VOTE RESOLVED</p>
                  {votingResults.isTie ? (
                    <>
                      <h2>The vote was tied.</h2>
                      <strong>Nobody was eliminated.</strong>
                      <p>
                        {votingResults.tiedPlayers?.map((player) => player.playerName).join(' and ')}
                        {' '}received the highest number of votes. {votingResults.imposterGuessPending
                          ? 'With two active players left, the Imposter is moving to the final guess.'
                          : 'Nobody is eliminated, and the next clue round is loading.'}
                      </p>
                    </>
                  ) : (
                    <>
                      <h2>{votingResults.eliminatedPlayer.playerName} was voted out.</h2>
                      <strong>{votingResults.isImposter ? 'Imposter found.' : 'They were a Listener.'}</strong>
                      <p>{votingResults.timedOut ? `The timer closed with ${votingResults.abstentions || 0} abstention${votingResults.abstentions === 1 ? '' : 's'}.` : votingResults.isImposter || votingResults.imposterGuessPending ? 'The Imposter gets one final chance to identify the Listener track.' : 'The Werewolf is still hidden. The next clue round is loading.'}</p>
                    </>
                  )}
                </section>
              )}

              {phase === 'spectating' && (
                <section className="hs-werewolf-panel hs-werewolf-panel--empty">
                  <span className="hs-panel-index">WATCH</span>
                  <h2>You are a spectator</h2>
                  <p>Watch the active players find the hidden signal.</p>
                </section>
              )}

              {phase === 'imposter-guess' && (
                <section className="hs-werewolf-panel hs-werewolf-panel--guess">
                  {role === 'imposter' ? (
                    <>
                      <div className="hs-werewolf-panel-heading"><span className="hs-panel-index">04</span><div><p className="hs-section-label">FINAL GUESS</p><h2>Which track was real?</h2></div></div>
                      <p className="hs-werewolf-panel-copy">Choose the Listener song before the room closes the case.</p>
                      <div className="hs-track-choice-list">
                        {roomUsers.flatMap((user) => user.topTracks || []).map((track, index) => (
                          <button key={`${track.id}-${index}`} onClick={() => {
                            socket.emit('submit-werewolf-final-guess', { roomCode, userId, guessedSongId: track.id });
                            setFinalGuess(track.id);
                          }} disabled={finalGuess !== null} className="hs-track-choice">
                            <img src={track.album?.images?.[0]?.url} alt="" />
                            <span><strong>{track.name}</strong><small>{track.artists?.[0]?.name}</small></span>
                            <ArrowIcon />
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="hs-werewolf-panel--empty"><span className="hs-panel-index">04</span><h2>The Imposter is guessing</h2><p>Waiting for the final track signal.</p></div>
                  )}
                </section>
              )}

              {phase === 'finished' && gameResult && (
                <section className={`hs-werewolf-panel hs-werewolf-panel--finished ${gameResult.winner === 'imposter' ? 'is-imposter-win' : 'is-listener-win'}`}>
                  <p className="hs-section-label">ROUND COMPLETE</p>
                  <h2>{gameResult.winner === 'imposter' ? 'The Imposter wins.' : 'The Listeners win.'}</h2>
                  <p className="hs-werewolf-panel-copy">The two signals are revealed below. The real Listener track is marked.</p>
                  <div className="hs-werewolf-result-artwork-grid" aria-label="Revealed album artwork">
                    <article className="hs-werewolf-result-art-card hs-werewolf-result-art-card--listener">
                      <div className="hs-werewolf-result-art-frame">
                        <img src={gameResult.listenerSong.image} alt={gameResult.listenerSong.name} />
                      </div>
                      <div className="hs-werewolf-result-art-meta">
                        <p className="hs-section-label">REAL SIGNAL</p>
                        <h3>{gameResult.listenerSong.name}</h3>
                        <p>{gameResult.listenerSong.artist}</p>
                      </div>
                    </article>
                    {gameResult.imposterSong && (
                      <article className="hs-werewolf-result-art-card hs-werewolf-result-art-card--imposter">
                        <div className="hs-werewolf-result-art-frame">
                          <img src={gameResult.imposterSong.image} alt={gameResult.imposterSong.name} />
                        </div>
                        <div className="hs-werewolf-result-art-meta">
                          <p className="hs-section-label">DECOY SIGNAL</p>
                          <h3>{gameResult.imposterSong.name}</h3>
                          <p>{gameResult.imposterSong.artist}</p>
                        </div>
                      </article>
                    )}
                  </div>
                  <div className="hs-werewolf-result-actions">
                    {isHost ? (
                      <>
                        <button type="button" onClick={handlePlayAgain} disabled={restarting} className="hs-werewolf-action hs-werewolf-action--primary">
                          <span>{restarting ? 'Opening new round…' : 'Play again'}</span><ArrowIcon />
                        </button>
                      </>
                    ) : (
                      <p className="hs-werewolf-host-note">Waiting for the host to start another round or end the game.</p>
                    )}
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default WerewolfGame;
