import { useEffect, useState } from 'react';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8888';

const RankGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 19V9m7 10V5m7 14v-7" />
    <path d="M3 19h18" />
  </svg>
);

const Rankings = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `${BACKEND_URL}/leaderboard?gameType=spotify_guess`
        );

        if (!response.ok) {
          throw new Error('Could not load leaderboard');
        }

        const data = await response.json();
        setLeaderboard(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Leaderboard error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <section className="hs-rankings" aria-labelledby="rankings-title">
      <div className="hs-rankings-hero">
        <div>
          <p className="hs-section-label">HARMONYSYNC / GAME SIGNAL</p>

          <h1 id="rankings-title">
            The players
            <br />
            <span>in orbit.</span>
          </h1>

          <p className="hs-rankings-intro">
            A living leaderboard of the players shaping HarmonySync through
            Spotify Guess.
          </p>
        </div>

        <div className="hs-rankings-orbit" aria-hidden="true">
          <span className="hs-rankings-orbit__ring hs-rankings-orbit__ring--outer" />
          <span className="hs-rankings-orbit__ring hs-rankings-orbit__ring--inner" />

          <span className="hs-rankings-orbit__core">
            <RankGlyph />
          </span>
        </div>
      </div>

      <div className="hs-rankings-grid">
        <section
          className="hs-rankings-list"
          aria-labelledby="leaderboard-title"
        >
          <div className="hs-ranking-heading">
            <div>
              <p className="hs-section-label">01 / LEADERBOARD</p>

              <h2 id="leaderboard-title">
                The players leading the board
              </h2>
            </div>

            <span>{leaderboard.length} players</span>
          </div>

          {loading ? (
            <p className="hs-ranking-empty">
              Loading the leaderboard…
            </p>
          ) : error ? (
            <p className="hs-ranking-empty">
              {error}
            </p>
          ) : leaderboard.length > 0 ? (
            <ol className="hs-ranking-rows">
              {leaderboard.map((player, index) => {
                const strength = Math.max(18, 100 - index * 8);

                return (
                  <li
                    key={player.userId}
                    className="hs-ranking-row"
                  >
                    <span className="hs-ranking-position">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {player.avatarUrl ? (
                      <img
                        src={player.avatarUrl}
                        alt=""
                      />
                    ) : (
                      <span
                        className="hs-ranking-avatar"
                        aria-hidden="true"
                      >
                        {player.displayName?.slice(0, 1) || '?'}
                      </span>
                    )}

                    <span className="hs-ranking-name">
                      <strong>
                        {player.displayName || 'HarmonySync player'}
                      </strong>

                      <small>
                        Spotify Guess
                      </small>
                    </span>

                    <span
                      className="hs-ranking-strength"
                      style={{
                        '--strength': `${strength}%`,
                      }}
                    >
                      <i />
                    </span>

                    <span className="hs-ranking-score">
                      {player.highScore}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="hs-ranking-empty">
              No scores yet. Play a game and claim your place.
            </p>
          )}
        </section>
      </div>
    </section>
  );
};

export default Rankings;
