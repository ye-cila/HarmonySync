import { useState } from 'react';

const BACKEND_URL = 'http://127.0.0.1:8888';

const Room = ({ onRoomJoined }) => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const createRoom = async () => {
    try {
      setError('');

      const response = await fetch(`${BACKEND_URL}/rooms`, {
        method: 'POST',
      });

      const data = await response.json();

      onRoomJoined(data.roomCode, data.users);
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      onRoomJoined(data.roomCode, data.users);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  return (
    <div>
      <button onClick={createRoom}>
        Create Room
      </button>

      <div>
        <input
          value={joinCode}
          onChange={(event) => setJoinCode(event.target.value)}
          placeholder="Enter room code"
        />

        <button onClick={joinRoom}>
          Join
        </button>
      </div>

      {error && <p>{error}</p>}
    </div>
  );
};

export default Room;