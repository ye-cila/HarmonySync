const RoomLobby = ({ roomCode, users }) => {
  return (
    <div className="w-full max-w-2xl bg-slate-800 p-6 rounded-2xl shadow-xl text-center">
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
            Players
        </h3>

        {users.map((user) => (
            <p key={user.id} className="text-gray-300">
            👤 Viber {user.id.slice(0, 6)}
            </p>
        ))}
        </div>

        <p className="text-gray-400">
        Waiting for other players to join...
        </p>
    </div>
  );
};

export default RoomLobby;