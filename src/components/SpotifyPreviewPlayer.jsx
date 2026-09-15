const SpotifyPreviewPlayer = ({ tracks }) => {
  const openSpotify = (track) => {
    const spotifyUrl = track.external_urls?.spotify;

    if (spotifyUrl) {
      window.open(spotifyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-3">
      {tracks.map((track, index) => (
        <div
          key={track.id}
          className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 transition"
        >
          {/* Album Art */}
          <img
            src={track.album?.images?.[0]?.url}
            alt={track.name}
            className="w-14 h-14 rounded-lg object-cover"
          />

          {/* Track Information */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">
              {index + 1}. {track.name}
            </p>

            <a
                href={track.artists?.[0]?.external_urls?.spotify}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-slate-400 hover:text-green-400 transition"
                >
                {track.artists?.map((artist) => artist.name).join(', ')}
                </a>
          </div>

          {/* Open Spotify Button */}
          <button
            onClick={() => openSpotify(track)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 hover:bg-green-400 text-black font-semibold transition"
          >
            <span>🎵</span>
            Spotify
          </button>
        </div>
      ))}
    </div>
  );
};

export default SpotifyPreviewPlayer;