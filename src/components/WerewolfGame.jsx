import { useEffect, useState } from 'react';

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

    useEffect(() => {
        if (!socket) {
            return;
        }

        const handleImposterGuessStart = () => {
            setPhase('imposter-guess');
        };

        const handleVotingStart = ({ clues }) => {
            setClues(clues);

            if (eliminatedPlayers.includes(userId)) {
            setPhase('spectating');
            return;
            }

            setPhase('voting');
        };

        const handleGameResult = (result) => {
            setGameResult(result);
            setPhase('finished');
        };

        const handleVotingResults = (result) => {
            setVotingResults(result);

            if (!result.isImposter) {
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
        if (!werewolfData) {
            return;
        }

        setRole(werewolfData.role);
        setSong(werewolfData.song);
        setPhase('clue');
    }, [werewolfData]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-8 text-center">
          🎵 Music Werewolf
        </h1>

        {phase === 'waiting' && (
          <div className="text-center">
            <p className="text-slate-400">
              Waiting for the game to start...
            </p>
          </div>
        )}

        {role && song && phase !== 'waiting' && (
          <div className="bg-slate-900 rounded-2xl p-6 mb-6">
            <p className="text-sm text-slate-400 mb-2">
              Your role
            </p>

            <p className="text-2xl font-bold mb-6">
              {role === 'imposter'
                ? '🐺 Imposter'
                : '🎧 Listener'}
            </p>

            <img
              src={song.image}
              alt={song.name}
              className="w-48 h-48 rounded-xl object-cover mx-auto"
            />

            <h2 className="text-xl font-semibold text-center mt-4">
              {song.name}
            </h2>

            <p className="text-slate-400 text-center">
              {song.artist}
            </p>
          </div>
        )}

        {phase === 'clue' && (
          <div className="bg-slate-900 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-2">
              Give one clue
            </h2>

            <p className="text-slate-400 mb-4">
              Describe your song without saying the song
              or artist.
            </p>

            <input
              value={clue}
              onChange={(e) => setClue(e.target.value)}
              placeholder="Your clue..."
              className="w-full p-3 rounded-lg bg-slate-800 mb-4"
            />

            <button
              disabled={!clue.trim()}
              onClick={() => {
                socket.emit('submit-werewolf-clue', {
                  roomCode,
                  userId,
                  clue,
                });

                setPhase('clue-submitted');
              }}
              className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
            >
              Submit clue
            </button>
          </div>
        )}

        {phase === 'clue-submitted' && (
          <div className="text-center">
            <p className="text-xl font-semibold">
              Clue submitted ✓
            </p>

            <p className="text-slate-400 mt-2">
              Waiting for everyone else...
            </p>
          </div>
        )}

        {phase === 'voting' && !eliminatedPlayers.includes(userId) && (
            <div className="bg-slate-900 rounded-2xl p-6">

                <h2 className="text-xl font-bold mb-6">
                🕵️ Who is the Imposter?
                </h2>

                <div className="space-y-3 mb-6">
                {clues.map((player) => (
                    <div
                    key={player.userId}
                    className="bg-slate-800 rounded-xl p-4"
                    >
                    <p className="font-semibold">
                        {player.playerName}
                    </p>

                    <p className="text-slate-300 mt-1">
                        "{player.clue}"
                    </p>
                    </div>
                ))}
                </div>

                <div className="space-y-2">
                {roomUsers
                    .filter(
                    (user) =>
                        !eliminatedPlayers.includes(user.id)
                    )
                    .map((user) => (
                    <button
                        key={user.id}
                        disabled={selectedVote !== null}
                        onClick={() => {
                        setSelectedVote(user.id);

                        socket.emit(
                            'submit-werewolf-vote',
                            {
                            roomCode,
                            userId,
                            votedUserId: user.id,
                            }
                        );
                        }}
                        className={`w-full p-3 rounded-lg transition ${
                        selectedVote === user.id
                            ? 'bg-purple-600'
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                    >
                        {user.playerName}
                    </button>
                    ))}
                </div>

                {selectedVote && (
                <p className="text-center text-slate-400 mt-4">
                    Vote submitted. Waiting for everyone...
                </p>
                )}

            </div>
        )}

        {phase === 'voting' && eliminatedPlayers.includes(userId) && (
            <div className="bg-slate-900 rounded-2xl p-8 text-center">

                <h2 className="text-2xl font-bold mb-4">
                👀 Watching
                </h2>

                <p className="text-slate-400">
                You’ve been eliminated, so you can watch the voting.
                </p>

            </div>
        )}
        
        {phase === 'voting-results' && votingResults && (
            <div className="bg-slate-900 rounded-2xl p-8 text-center">

                <h2 className="text-3xl font-bold mb-6">
                🗳️ Vote Results
                </h2>

                <p className="text-xl font-semibold mb-2">
                {votingResults.eliminatedPlayer.playerName}
                {' '}was voted out.
                </p>

                {votingResults.isImposter ? (
                <>
                    <p className="text-2xl font-bold text-purple-400 mt-4">
                    🐺 They were the Imposter!
                    </p>

                    <p className="text-slate-400 mt-3">
                    The Imposter gets one final chance to guess the Listener song.
                    </p>

                </>
                ) : (
                <>
                    <p className="text-2xl font-bold text-red-400 mt-4">
                    🎧 They were a Listener.
                    </p>

                    <p className="text-xl font-semibold mt-4">
                    🐺 The Werewolf is still alive!
                    </p>

                    <p className="text-slate-400 mt-3">
                    This player is eliminated and can only watch the rest of the game.
                    </p>

                </>
                )}

            </div>
        )}

        {phase === 'spectating' && (
            <div className="bg-slate-900 rounded-2xl p-8 text-center">

                <h2 className="text-3xl font-bold mb-4">
                👀 You’ve Been Eliminated
                </h2>

                <p className="text-slate-400">
                You are now a spectator.
                </p>

                <p className="text-slate-400 mt-2">
                Watch the remaining players find the Werewolf.
                </p>

            </div>
        )}

        {phase === 'imposter-guess' && (
            <div className="bg-slate-900 rounded-2xl p-8">
                {role === 'imposter' ? (
                <>
                    <h2 className="text-3xl font-bold mb-4 text-center">
                    🐺 Final Guess
                    </h2>

                    <p className="text-slate-400 text-center mb-6">
                    Which song do you think the Listeners had?
                    </p>

                    <div className="space-y-3">
                    {roomUsers.flatMap(
                        (user) => user.topTracks || []
                    ).map((track) => (
                        <button
                        key={track.id}
                        onClick={() => {
                            socket.emit(
                            'submit-werewolf-final-guess',
                            {
                                roomCode,
                                userId,
                                guessedSongId: track.id,
                            }
                            );

                            setFinalGuess(track.id);
                        }}
                        disabled={finalGuess !== null}
                        className="w-full flex items-center gap-4 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
                        >
                        <img
                            src={track.album?.images?.[0]?.url}
                            alt={track.name}
                            className="w-12 h-12 rounded-lg object-cover"
                        />

                        <div className="text-left">
                            <p className="font-semibold">
                            {track.name}
                            </p>

                            <p className="text-sm text-slate-400">
                            {track.artists?.[0]?.name}
                            </p>
                        </div>
                        </button>
                    ))}
                    </div>
                </>
                ) : (
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">
                    🐺 The Imposter Is Guessing
                    </h2>

                    <p className="text-slate-400">
                    Waiting for the Imposter's final guess...
                    </p>
                </div>
                )}
            </div>
        )}

        {phase === 'finished' && gameResult && (
            <div className="bg-slate-900 rounded-2xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">
                {gameResult.winner === 'imposter'
                    ? '🐺 Imposter Wins!'
                    : '🎧 Listeners Win!'}
                </h2>

                <img
                src={gameResult.listenerSong.image}
                alt={gameResult.listenerSong.name}
                className="w-48 h-48 rounded-xl object-cover mx-auto"
                />

                <h3 className="text-xl font-semibold mt-4">
                {gameResult.listenerSong.name}
                </h3>

                <p className="text-slate-400">
                {gameResult.listenerSong.artist}
                </p>
            </div>
        )}

      </div>
    </div>
  );
};

export default WerewolfGame;