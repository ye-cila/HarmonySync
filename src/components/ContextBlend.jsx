const CONTEXTS = [
  { id: 'focus', label: 'Study / Focus', hint: 'Low-distraction momentum' },
  { id: 'roadtrip', label: 'Roadtrip', hint: 'Familiar hooks + discovery' },
  { id: 'party', label: 'Party', hint: 'High-energy, danceable tracks' },
];

const ContextBlend = ({ isHost, selectedContext, onSelectContext, blend, error }) => {
  const selected = CONTEXTS.find((context) => context.id === selectedContext) || CONTEXTS[0];

  return (
    <section className="hs-blend-panel mt-8 border-t border-slate-700/80 pt-7 text-left" aria-labelledby="blend-heading">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 id="blend-heading" className="text-xl font-semibold tracking-tight text-white">Context Blend</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
            Shape the playlist around the moment, not just the overlap in your listening history.
          </p>
        </div>
        <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-200">
          {isHost ? 'Host controls' : 'Host selected'}
        </span>
      </div>

      <div className="hs-blend-signal" aria-live="polite">
        <span className="hs-blend-signal__pulse" />
        <span className="hs-blend-signal__label">Context signal</span>
        <strong>{selected.label}</strong>
        <span className="hs-blend-signal__rule" />
        <span className="hs-blend-signal__count">{blend?.tracks?.length || 0} tracks tuned</span>
      </div>

      {isHost ? (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Choose your Blend vibe</p>
      ) : (
        <p className="mb-3 text-sm text-slate-300">The host selected <span className="font-semibold text-teal-300">{selected.label}</span>.</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CONTEXTS.map((context) => {
          const active = selectedContext === context.id;
          return (
            <button
              key={context.id}
              type="button"
              disabled={!isHost}
              aria-pressed={active}
              onClick={() => onSelectContext(context.id)}
              className={`rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-teal-300/70 ${
                active
                  ? 'border-teal-300 bg-teal-300/15 text-white shadow-[0_12px_30px_rgba(45,212,191,0.08)]'
                  : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500'
              } ${!isHost ? 'cursor-default opacity-90' : ''}`}
            >
              <span className="block font-semibold">{context.label}</span>
              <span className="mt-1 block text-xs text-slate-400">{context.hint}</span>
            </button>
          );
        })}
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      {blend?.tracks?.length > 0 && (
        <div key={blend.context?.id || selectedContext} className="hs-blend-playlist mt-7" data-context={blend.context?.id || selectedContext}>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h4 className="font-semibold text-teal-200" aria-live="polite">{blend.context?.label} playlist</h4>
              <p className="mt-1 text-xs text-slate-400">{blend.context?.description}</p>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-slate-500">{blend.tracks.length} unique tracks</span>
          </div>

          <ol className="grid gap-2 sm:grid-cols-2">
            {blend.tracks.map((track, index) => (
              <li key={`${blend.context?.id || selectedContext}-${track.id}`} className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
                <span className="w-6 shrink-0 text-center text-xs tabular-nums text-slate-500">{index + 1}</span>
                {track.image && <img src={track.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />}
                <div className="min-w-0 flex-1">
                  <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer" className="block truncate font-medium text-slate-100 underline-offset-4 hover:text-teal-300 hover:underline">
                    {track.name}
                  </a>
                  <p className="truncate text-xs text-slate-400">{(track.artists || []).join(', ')}</p>
                </div>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-500" title="How many listeners or artists in the room connect to this track">
                  {track.reasons?.discovery ? 'Discovery' : `${track.reasons?.sharedListeners || 1} listeners`}
                </span>
              </li>
            ))}
          </ol>

          {blend.compatibility?.[0]?.overlaps?.length > 0 && (
            <div className="mt-6 rounded-2xl border border-slate-700/70 bg-slate-900/50 p-4 text-sm text-slate-300">
              <h4 className="mb-2 font-semibold text-white">Compatibility snapshot</h4>
              {blend.compatibility.map((row) => (
                <p key={row.userId} className="mb-1 last:mb-0 leading-6">
                  {row.playerName}: {row.overlaps.map((overlap) => `${overlap.score}% with ${overlap.withPlayerName}`).join(' · ')}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ContextBlend;
