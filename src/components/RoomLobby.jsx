const RoomLobby = ({
  roomCode,
  users,
  blend,
  harmonyPlaylist,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 p-6 rounded-2xl shadow-xl text-center">
      <h2 className="text-2xl font-bold mb-4">
        Room Lobby
      </h2>

      <p className="text-gray-400 mb-2">
        Share this room code with your friend:
      </p>

      <p className="text-4xl font-bold tracking-widest text-green-500 mb-6">
        {roomCode}
      </p>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">
            Vibers
        </h3>

        {users.map((user) => (
            <p key={user.id} className="text-gray-300">
            👤 Viber {user.id.slice(0, 6)}
            </p>
        ))}
        </div>

        <p className="text-gray-400">
        Waiting for other vibers to join...
        </p>

        {blend && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">
              🎵 Harmony Score
            </h3>

            <p className="text-5xl font-bold text-green-500">
              {blend.score}%
            </p>

            <p className="text-gray-400 mt-2">
              {blend.sharedCount} shared artists
            </p>

            {blend.sharedArtists.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">
                  You both vibe with:
                </p>

                <div className="max-h-40 overflow-y-auto flex flex-wrap justify-center gap-4">
                  {blend.sharedArtists.map((artist) => (
                    <div
                      key={artist.id || artist.name}
                      className="w-fit mx-auto bg-slate-700 px-4 py-2 rounded-full text-sm"
                    >
                      <b> {artist.name} </b>
                    </div>
                  ))}
                </div>

                {harmonyPlaylist.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 text-green-300">
                      🎵 Your Harmony Playlist
                    </h3>

                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {harmonyPlaylist.map((track, index) => (
                        <div
                          key={track.id}
                          className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-xl"
                        >
                          <span className="text-slate-400 font-bold w-6">
                            {index + 1}
                          </span>

                          {track.album?.images?.[0]?.url && (
                            <img
                              src={track.album.images[0].url}
                              alt=""
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}

                          <div className="min-w-0 flex-1 text-left">
                            <p className="font-semibold text-sm truncate">
                              {track.name}
                            </p>

                            <p className="text-xs text-slate-400 truncate">
                              {track.artists.map((artist) => artist.name).join(', ')}
                            </p>
                          </div>

                          <span className="text-xs text-green-400">
                            {track.harmonyScore} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default RoomLobby;