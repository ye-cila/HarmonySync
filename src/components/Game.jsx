import { useEffect, useRef, useState } from 'react';

const EndGameButton = ({ isHost, onEndGame }) => {
  if (!isHost) {
    return null;
  }

  return (
    <button type="button" onClick={onEndGame} className="hs-game-end-action">
      End Game
    </button>
  );
};

const Game = ({
  round,
  roundResult,
  roomUsers,
  isHost,
  onAnswer,
  onNextRound,
  onEndGame,
  onQuit,
}) => {
  const [countdown, setCountdown] = useState(15);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const audioRef = useRef(null);

  // Question countdown
  useEffect(() => {
    if (!round || roundResult) {
      return;
    }

    setCountdown(15);
    setHasAnswered(false);

    const timer = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [round, roundResult]);

  // Play music when a new round starts
  useEffect(() => {
    if (!round?.track?.preview) {
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = round.track.preview;

      audioRef.current.play().catch((error) => {
        console.log('Audio autoplay was blocked:', error);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [round]);

  // Stop music when round ends
  useEffect(() => {
    if (roundResult && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [roundResult]);

  // Result countdown
  useEffect(() => {
    if (!roundResult) {
      return;
    }

    setCountdown(5);

    const timer = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          clearInterval(timer);
          onNextRound();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [roundResult, onNextRound]);

  if (!round) {
    return (
      <div className="hs-game-shell hs-game-state w-full max-w-2xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-xl text-center">
        <div className="hs-eyebrow"><span className="hs-live-dot" /> CONNECTING TO THE SIGNAL</div>
        <p className="text-gray-400">
          Loading first round...
        </p>
        <div className="hs-game-state-actions">
          <EndGameButton isHost={isHost} onEndGame={onEndGame} />
        </div>
      </div>
    );
  }

  // Show this player's result
  if (roundResult) {
    return (
      <div
        className={`hs-game-shell hs-game-result w-full max-w-2xl mx-auto p-8 rounded-2xl shadow-xl text-center ${roundResult.correct ? 'hs-game-result--correct' : 'hs-game-result--wrong'}`}
        aria-live="polite"
      >
        <div className="hs-result-signal" aria-hidden="true">
          <svg viewBox="0 0 48 48" role="presentation">
            <path d={roundResult.correct ? 'M13 25.5 21 33l14-17' : 'M16 16l16 16M32 16 16 32'} />
          </svg>
        </div>

        <p className="hs-result-kicker">{roundResult.correct ? 'Signal match' : 'Signal mismatch'}</p>
        <h1 className="text-4xl font-bold text-white mb-4">
          {roundResult.correct ? 'Correct' : 'Wrong'}
        </h1>

        <p className="text-white text-2xl font-bold mb-2">
          +{roundResult.points} points
        </p>

        <p className="hs-result-time text-white/80 mb-8">
          {(roundResult.time / 1000).toFixed(1)}s
        </p>

        <h2 className="text-2xl font-bold text-white mb-4">
          Leaderboard
        </h2>

        <div className="space-y-2">
          {roundResult.leaderboard.map((player, index) => {
            const playerInfo = roomUsers.find(
              (user) => user.id === player.userId
            );

            return (
              <div
                key={player.userId}
                className="bg-slate-900/40 px-4 py-3 rounded-xl flex justify-between"
              >
                <span className="text-white font-semibold">
                  {index + 1}. {playerInfo?.playerName}
                </span>

                <span className="text-yellow-300 font-bold">
                  {player.score} pts
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-white/80 mt-6">
          Next round in {countdown}...
        </p>

        <div className="hs-game-state-actions">
          <EndGameButton isHost={isHost} onEndGame={onEndGame} />
        </div>
      </div>
    );
  }

  // Quit confirmation
  if (showQuitConfirm) {
    return (
      <div className="hs-game-shell hs-game-quit w-full max-w-2xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-xl text-center">
        <h2 className="text-3xl font-bold text-white mb-3">
          Quit the game?
        </h2>

        <p className="text-gray-400 mb-8">
          You'll leave this game and lose your current score.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => setShowQuitConfirm(false)}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition"
          >
            Cancel
          </button>

          <button
            onClick={onQuit}
            className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-6 rounded-xl transition"
          >
            Quit Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hs-game-shell w-full max-w-2xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-xl text-center">

      <div className="hs-game-topbar">
        <div className="hs-game-topbar__identity">
          <span className="hs-eyebrow"><span className="hs-live-dot" /> LIVE ROUND</span>
        </div>
        <div className="hs-game-topbar__actions">
          <EndGameButton isHost={isHost} onEndGame={onEndGame} />
          <span className="hs-round-chip">ROUND {String(round.round).padStart(2, '0')}</span>
          <span className={`hs-countdown-chip ${countdown <= 5 ? 'hs-countdown-chip--urgent' : ''}`}>00:{String(countdown).padStart(2, '0')}</span>
        </div>
      </div>

      <p className="hs-game-kicker text-green-400 font-semibold mb-2">WHO OWNS THIS SIGNAL?</p>

      <h1 className="text-3xl font-bold text-white mb-4">
        Whose Taste?
      </h1>

      {/* Countdown */}
      <div className="mb-5">
        <p className="text-gray-400 text-sm mb-1">
          Time left
        </p>

        <p
          className={`text-4xl font-bold ${
            countdown <= 5
              ? 'text-red-400'
              : 'text-green-400'
          }`}
        >
          {countdown}
        </p>
      </div>

      {/* Hidden audio player */}
      <audio
        ref={audioRef}
        preload="auto"
      />

      <div className="mb-8">
        <div className="hs-audio-wave" aria-label={round.track.preview ? 'Audio preview is connected' : 'No audio preview available'}>
          {Array.from({ length: 18 }, (_, index) => <span key={index} style={{ '--wave-delay': `${index * -0.07}s`, '--wave-height': `${28 + ((index * 17) % 68)}%` }} />)}
        </div>
        {round.track.image && (
          <img
            src={round.track.image}
            alt=""
            className="w-48 h-48 mx-auto rounded-2xl object-cover mb-4"
          />
        )}

        <h2 className="text-2xl font-bold text-white">
          {round.track.name}
        </h2>

        <p className="text-gray-400 mt-1">
          {round.track.artist}
        </p>

        {!round.track.preview && (
          <p className="text-gray-500 text-sm mt-3">
            No preview available for this track
          </p>
        )}
      </div>

      <p className="hs-game-question text-gray-300 mb-4">
        Who has this song in their Top Tracks?
      </p>

      <div className="space-y-3">
        {round.choices.map((player) => {
          const playerInfo = roomUsers.find(
            (user) => user.id === player.id
          );

          return (
            <button
              key={player.id}
              disabled={hasAnswered}
              onClick={() => {
                setHasAnswered(true);
                onAnswer(player.id);
              }}
              className="w-full bg-slate-700 hover:bg-green-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition"
            >
              {playerInfo?.playerName}
            </button>
          );
        })}
      </div>

      {!isHost && (
        <button
          onClick={() => setShowQuitConfirm(true)}
          className="hs-quiet-action mt-6 text-gray-400 hover:text-red-400 text-sm transition"
        >
          Quit Game
        </button>
      )}
    </div>
  );
};

export default Game;
