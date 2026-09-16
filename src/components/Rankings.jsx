const RankGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 19V9m7 10V5m7 14v-7" />
    <path d="M3 19h18" />
  </svg>
);

const Rankings = ({ artists, tracks, loading }) => (
  <section className="hs-rankings" aria-labelledby="rankings-title">
    <div className="hs-rankings-hero">
      <div>
        <p className="hs-section-label">HARMONYSYNC / TASTE SIGNAL</p>
        <h1 id="rankings-title">Your listening<br /><span>in orbit.</span></h1>
        <p className="hs-rankings-intro">
          A living snapshot of the artists and songs shaping your signal right now.
        </p>
      </div>
      <div className="hs-rankings-orbit" aria-hidden="true">
        <span className="hs-rankings-orbit__ring hs-rankings-orbit__ring--outer" />
        <span className="hs-rankings-orbit__ring hs-rankings-orbit__ring--inner" />
        <span className="hs-rankings-orbit__core"><RankGlyph /></span>
      </div>
    </div>

    <div className="hs-rankings-grid">
      <section className="hs-rankings-list" aria-labelledby="artists-title">
        <div className="hs-ranking-heading">
          <div>
            <p className="hs-section-label">01 / TOP ARTISTS</p>
            <h2 id="artists-title">The names in your mix</h2>
          </div>
          <span>{artists.length} ranked</span>
        </div>

        {loading ? (
          <p className="hs-ranking-empty">Reading your Spotify signal…</p>
        ) : artists.length > 0 ? (
          <ol className="hs-ranking-rows">
            {artists.map((artist, index) => {
              const strength = Math.max(18, 100 - index * 8);
              return (
                <li key={artist.id || artist.name} className="hs-ranking-row">
                  <span className="hs-ranking-position">{String(index + 1).padStart(2, '0')}</span>
                  {artist.images?.[0]?.url ? (
                    <img src={artist.images[0].url} alt="" />
                  ) : (
                    <span className="hs-ranking-avatar" aria-hidden="true">{artist.name?.slice(0, 1)}</span>
                  )}
                  <span className="hs-ranking-name">
                    <a href={artist.external_urls?.spotify} target="_blank" rel="noopener noreferrer">
                      {artist.name}
                    </a>
                    <small>{artist.genres?.slice(0, 2).join(' · ') || 'Genre signal forming'}</small>
                  </span>
                  <span className="hs-ranking-strength" style={{ '--strength': `${strength}%` }}>
                    <i />
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="hs-ranking-empty">No artist signal yet. Play a few songs and check back.</p>
        )}
      </section>

      <aside className="hs-ranking-side" aria-labelledby="tracks-title">
        <p className="hs-section-label">02 / RECENT ROTATION</p>
        <h2 id="tracks-title">Songs carrying the room</h2>
        <p className="hs-ranking-side__copy">These tracks are the quickest read on your current mood.</p>
        <ol className="hs-track-mini-list">
          {tracks.slice(0, 5).map((track, index) => (
            <li key={track.id || `${track.name}-${index}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{track.name}</strong>
                <small>{track.artists?.map((artist) => artist.name).join(', ')}</small>
              </div>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  </section>
);

export default Rankings;
