import { useEffect, useState } from 'react';

const FEATURES = [
  { id: 'blend', label: 'Blend', detail: 'Find the overlap', angle: -42 },
  { id: 'rooms', label: 'Rooms', detail: 'Listen together', angle: 0 },
  { id: 'werewolf', label: 'Werewolf', detail: 'Play with taste', angle: 42 },
  { id: 'profile', label: 'Profile', detail: 'See your signal', angle: 180 },
];

const NOTE_PARTICLES = [
  { x: 18, y: 22, size: 'small', delay: '-1s', variant: 'cyan' },
  { x: 28, y: 73, size: 'tiny', delay: '-4s', variant: 'violet' },
  { x: 37, y: 18, size: 'tiny', delay: '-2s', variant: 'cyan' },
  { x: 44, y: 82, size: 'small', delay: '-6s', variant: 'violet' },
  { x: 55, y: 24, size: 'tiny', delay: '-3s', variant: 'cyan' },
  { x: 63, y: 78, size: 'tiny', delay: '-7s', variant: 'cyan' },
  { x: 73, y: 20, size: 'small', delay: '-5s', variant: 'violet' },
  { x: 82, y: 68, size: 'tiny', delay: '-1.5s', variant: 'cyan' },
  { x: 11, y: 52, size: 'tiny', delay: '-8s', variant: 'violet' },
  { x: 91, y: 42, size: 'small', delay: '-2.5s', variant: 'cyan' },
  { x: 23, y: 40, size: 'tiny', delay: '-5.5s', variant: 'cyan' },
  { x: 78, y: 84, size: 'tiny', delay: '-3.5s', variant: 'violet' },
  { x: 34, y: 31, size: 'tiny', delay: '-6.5s', variant: 'cyan' },
  { x: 67, y: 58, size: 'small', delay: '-4.5s', variant: 'violet' },
  { x: 86, y: 26, size: 'tiny', delay: '-7.5s', variant: 'cyan' },
  { x: 15, y: 82, size: 'tiny', delay: '-9s', variant: 'violet' },
];

const MusicNote = ({ small = false }) => (
  <svg className={small ? 'landing-note landing-note--small' : 'landing-note'} viewBox="0 0 100 100" aria-hidden="true">
    <path d="M63 17v49.5a15 15 0 1 1-7-12.9V28l30-7v42.5a15 15 0 1 1-7-12.9V17H63Z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M63 17h23" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const HeadphonesGlyph = () => (
  <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M7 22a13 13 0 0 1 26 0v8a4 4 0 0 1-4 4h-3v-11h7M7 22v8a4 4 0 0 0 4 4h3V23H7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const WaveGlyph = () => (
  <svg viewBox="0 0 60 24" aria-hidden="true"><path d="M1 13c5 0 5-6 10-6s5 10 10 10 5-14 10-14 5 11 10 11 5-5 18-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
);

const StaffLines = ({ hoveredFeature, selectedFeature, onHoverFeature, onSelectFeature }) => {
  const staff = [
    { id: 'blend', paths: ['M500 394 C555 356 592 418 650 365 S775 252 900 278', 'M500 400 C560 362 596 424 654 371 S780 258 900 284', 'M500 406 C565 368 600 430 658 377 S785 264 900 290', 'M500 412 C570 374 604 436 662 383 S790 270 900 296', 'M500 418 C575 380 608 442 666 389 S795 276 900 302'] },
    { id: 'rooms', paths: ['M505 397 C570 370 615 430 680 397 S820 375 955 400', 'M505 403 C570 376 615 436 680 403 S820 381 955 406', 'M505 409 C570 382 615 442 680 409 S820 387 955 412', 'M505 415 C570 388 615 448 680 415 S820 393 955 418', 'M505 421 C570 394 615 454 680 421 S820 399 955 424'] },
    { id: 'werewolf', paths: ['M500 406 C560 448 610 392 675 455 S805 566 900 570', 'M500 412 C560 454 610 398 675 461 S805 572 900 576', 'M500 418 C560 460 610 404 675 467 S805 578 900 582', 'M500 424 C560 466 610 410 675 473 S805 584 900 588', 'M500 430 C560 472 610 416 675 479 S805 590 900 594'] },
    { id: 'profile', paths: ['M495 400 C430 372 388 428 320 400 S165 382 55 400', 'M495 406 C430 378 388 434 320 406 S165 388 55 406', 'M495 412 C430 384 388 440 320 412 S165 394 55 412', 'M495 418 C430 390 388 446 320 418 S165 400 55 418', 'M495 424 C430 396 388 452 320 424 S165 406 55 424'] },
  ];

  return (
    <svg className="landing-music-lines" viewBox="0 0 1000 800" preserveAspectRatio="none" aria-hidden="true">
      {staff.map((branch) => (
        <g
          key={branch.id}
          className={`landing-staff landing-staff--${branch.id} ${hoveredFeature === branch.id ? 'landing-staff--active' : ''} ${selectedFeature === branch.id ? 'landing-staff--selected' : ''}`}
          onPointerEnter={() => onHoverFeature(branch.id)}
          onPointerLeave={() => onHoverFeature(null)}
          onPointerDown={() => {
            onHoverFeature(branch.id);
            onSelectFeature(branch.id);
          }}
          onClick={() => onSelectFeature(branch.id)}
        >
          {branch.paths.map((path) => <path key={path} d={path} />)}
          <g className="landing-staff-note">
            <circle r="4" />
            <path d="M4 0V-13" />
            <animateMotion dur={`${3.8 + branch.id.length / 10}s`} repeatCount="indefinite" path={branch.paths[2]} />
          </g>
        </g>
      ))}
    </svg>
  );
};

const NoteField = () => (
  <div className="landing-note-field" aria-hidden="true">
    {NOTE_PARTICLES.map((note, index) => (
      <span
        key={`${note.x}-${note.y}-${index}`}
        className={`landing-note-particle landing-note-particle--${note.size} landing-note-particle--${note.variant}`}
        style={{ '--note-x': `${note.x}%`, '--note-y': `${note.y}%`, '--note-delay': note.delay }}
      >
        <MusicNote small />
      </span>
    ))}
  </div>
);

const LandingPage = ({ onLogin }) => {
  const [revealed, setRevealed] = useState(true);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [pointer, setPointer] = useState({ x: 50, y: 46 });

  useEffect(() => {
    const handlePointer = (event) => {
      const point = event.touches?.[0] || event;
      setPointer({
        x: (point.clientX / window.innerWidth) * 100,
        y: (point.clientY / window.innerHeight) * 100,
      });
      setRevealed(true);
    };

    window.addEventListener('pointermove', handlePointer, { passive: true });
    window.addEventListener('touchmove', handlePointer, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('touchmove', handlePointer);
    };
  }, []);

  const handleFeature = (feature) => {
    setHoveredFeature(feature.id);
    setSelectedFeature(feature.id);
    if (feature.id === 'rooms' || feature.id === 'profile' || feature.id === 'blend' || feature.id === 'werewolf') onLogin();
  };

  return (
    <main
      className={`landing-shell ${navigationOpen ? 'landing-shell--navigation' : ''}`}
      style={{ '--pointer-x': `${pointer.x}%`, '--pointer-y': `${pointer.y}%` }}
    >
      <header className="landing-topbar">
        <button type="button" className="landing-mini-brand" onClick={() => { setNavigationOpen(false); setSelectedFeature(null); }} aria-label="HarmonySync home">
          <img src="/harmonysync-mark.png" alt="" />
          <span>HarmonySync</span>
        </button>
        <nav className="landing-topnav" aria-label="Main navigation">
          <button type="button" onClick={onLogin}>Blend</button>
          <button type="button" onClick={onLogin}>Rankings</button>
          <button type="button" onClick={onLogin}>Create room</button>
          <button type="button" onClick={onLogin}>Werewolf</button>
        </nav>
        <button type="button" className="landing-top-action" onClick={onLogin}>Enter <span aria-hidden="true">↗</span></button>
      </header>

      <div className="landing-noise" />
      <div className="landing-orbit landing-orbit--one" />
      <div className="landing-orbit landing-orbit--two" />
      <div className="landing-particle landing-particle--one" />
      <div className="landing-particle landing-particle--two" />
      <div className="landing-particle landing-particle--three" />
      <NoteField />

      <div className="landing-ambient-label landing-ambient-label--left">Shared taste / 01</div>
      <div className="landing-ambient-label landing-ambient-label--right">Live signal / 2026</div>

      <div className="landing-decoration landing-decoration--left">
        <span className="landing-decoration__icon"><HeadphonesGlyph /></span>
        <span><strong>Rooms in sync</strong><small>listen together</small></span>
        <span className="landing-eq"><i /><i /><i /><i /><i /></span>
      </div>
      <div className="landing-decoration landing-decoration--right">
        <span><strong>Made from taste</strong><small>not just a queue</small></span>
        <span className="landing-wave"><WaveGlyph /></span>
      </div>

      <div className="landing-center">
        <div className="landing-wordmark" aria-hidden={!revealed}>
          <span className="landing-wordmark__line">Harmony</span>
          <span className="landing-wordmark__line landing-wordmark__line--accent">Sync</span>
        </div>
        <p className="landing-kicker">A shared listening space</p>
        <p className="landing-value-proposition">Blend your Spotify taste into rooms, games, and the songs between you.</p>
        <button
          type="button"
          className={`landing-logo ${revealed ? 'landing-logo--revealed' : ''} ${navigationOpen ? 'landing-logo--open' : ''}`}
          onPointerEnter={() => setRevealed(true)}
          onClick={() => {
            setRevealed(true);
            setNavigationOpen((open) => !open);
          }}
          aria-label="Open HarmonySync navigation"
          aria-expanded={navigationOpen}
        >
          <span className="landing-logo__core">
            <img className="landing-logo__art" src="/harmonysync-mark.png" alt="" />
          </span>
        </button>

        <p className={`landing-prompt ${revealed ? 'landing-prompt--hidden' : ''}`}>Move through the signal</p>
        <button type="button" className="landing-enter" onClick={onLogin}>Enter HarmonySync <span aria-hidden="true">↗</span></button>
        <div className="landing-hero-meta"><span>Curate together</span><b /> <span>Play in sync</span><b /> <span>Discover more</span></div>
      </div>

      <div className={`landing-lines ${navigationOpen ? 'landing-lines--open' : ''}`} aria-hidden={!navigationOpen}>
        <StaffLines
          hoveredFeature={hoveredFeature}
          selectedFeature={selectedFeature}
          onHoverFeature={setHoveredFeature}
          onSelectFeature={setSelectedFeature}
        />
      </div>

      <nav className={`landing-nav ${navigationOpen ? 'landing-nav--open' : ''}`} aria-label="HarmonySync features">
        {FEATURES.map((feature) => (
          <button
            type="button"
            key={feature.id}
            className={`landing-feature landing-feature--${feature.id} ${hoveredFeature === feature.id ? 'landing-feature--active' : ''}`}
            onMouseEnter={() => setHoveredFeature(feature.id)}
            onFocus={() => setHoveredFeature(feature.id)}
            onMouseLeave={() => setHoveredFeature(null)}
            onClick={() => handleFeature(feature)}
          >
            <span className="landing-feature__dot" />
            <span><strong>{feature.label}</strong><small>{feature.detail}</small></span>
          </button>
        ))}
      </nav>

      <p className="landing-footer"><span></span><i /> A shared listening space for the music between us.</p>
    </main>
  );
};

export default LandingPage;
