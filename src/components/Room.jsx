import { useState } from 'react';

const BACKEND_URL = 'http://127.0.0.1:8888';

const Room = ({ onRoomJoined }) => {
  const [joinCode, setJoinCode] = useState('');
  const [maxUsers, setMaxUsers] = useState(4);
  const [error, setError] = useState('');
  
  const createRoom = async () => {
    try {
      setError('');

      const response = await fetch(`${BACKEND_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxUsers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not create room');
      }

      onRoomJoined(data.roomCode, data.userId, data.users);

    } catch (error) {
      console.error(error);
      setError('Could not create room');
    }
  };

  const joinRoom = async () => {
    try {
      setError('');

      const response = await fetch(
        `${BACKEND_URL}/rooms/${joinCode}/join`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      onRoomJoined(data.roomCode, data.userId, data.users);

    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold tracking-tight text-white mb-3">
          Harmony<span className="text-green-500">Sync</span>
        </h1>

        <p className="text-gray-400 text-lg">
          Find the perfect music to listen to together.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">

        {/* Create Room */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Start a Room
          </h2>

          <p className="text-gray-400 text-sm mb-6">
            Create a room and sync together.
          </p>

          {/* Maximum Users */}
          <div className="mb-6">
            <p className="text-gray-300 text-sm mb-3">
              Maximum people
            </p>

            <div className="grid grid-cols-7 gap-2">
              {[2, 3, 4, 5, 6, 7, 8].map((number) => (
                <button
                  key={number}
                  onClick={() => setMaxUsers(number)}
                  className={`py-2 rounded-lg font-semibold transition ${
                    maxUsers === number
                      ? 'bg-green-500 text-black'
                      : 'bg-slate-900 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={createRoom}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-6 rounded-xl transition duration-200"
          >
            Create Room
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-slate-600"></div>

          <span className="text-gray-500 text-sm font-medium">
            OR
          </span>

          <div className="flex-1 h-px bg-slate-600"></div>
        </div>

        {/* Join Room */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2 text-center">
            Join a Room
          </h2>

          <p className="text-gray-400 text-sm mb-6 text-center">
            Enter the room code.
          </p>

          <div className="flex gap-3">
            <input
              value={joinCode}
              onChange={(event) =>
                setJoinCode(event.target.value.toUpperCase())
              }
              placeholder="ROOM CODE"
              maxLength={6}
              className="flex-1 bg-slate-900 border border-slate-600 text-white text-center tracking-widest font-semibold rounded-xl px-4 py-3 outline-none focus:border-green-500 transition"
            />

            <button
              onClick={joinRoom}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 rounded-xl transition duration-200"
            >
              Join
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm text-center mt-5">
            {error}
          </p>
        )}
      </div>
    </div>
  );

};

export default Room;