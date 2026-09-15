const RoomLobby = ({
  roomCode,
  users,
  isHost,
  onStartGame,
}) => {

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 p-6 rounded-2xl shadow-xl text-center">

      <h2 className="text-2xl font-bold mb-4 text-white">
        Game Lobby
      </h2>

      <p className="text-gray-400 mb-2">
        Share this room code with your friends:
      </p>

      <p className="text-4xl font-bold tracking-widest text-green-500 mb-6">
        {roomCode}
      </p>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          Players
        </h3>

        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-slate-700/50 px-4 py-3 rounded-xl text-gray-300"
            >
              👤 {user.playerName}
            </div>
          ))}
        </div>
      </div>

      <p className="text-gray-400 mb-6">
        {users.length < 2
          ? 'Waiting for another player to join...'
          : 'Everyone is ready? Let the game begin!'}
      </p>

      {isHost && (
        <button
          onClick={onStartGame}
          disabled={users.length < 2}
          className="w-full bg-green-500 hover:bg-green-400 disabled:bg-slate-600 disabled:text-gray-400 text-black font-bold py-3 px-6 rounded-xl transition"
        >
          Start Game
        </button>
      )}

      {!isHost && users.length >= 2 && (
        <p className="text-gray-400 text-sm">
          Waiting for the host to start the game...
        </p>
      )}

    </div>
  );
};

export default RoomLobby;