import { useState } from 'react';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8888';

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M6 3h7v7" /></svg>
);

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

      onRoomJoined(data.roomCode, data.userId, data.users, data.maxUsers);

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

      onRoomJoined(data.roomCode, data.userId, data.users, data.maxUsers);

    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  return (
    <div className="hs-room-shell w-full mx-auto">
      <div className="hs-room-hero">
        <div className="hs-room-heading">
          <p className="hs-room-location">HARMONYSYNC / PRIVATE ROOM</p>
          <h1 className="hs-room-title">
            Open the room.<br /><span>Keep the signal.</span>
          </h1>
          <p className="hs-room-subtitle">Bring your people together, then let the music find the common ground.</p>

          <div className="hs-room-stats" aria-label="Room capabilities">
            <span><b /> Spotify taste</span>
            <span><b /> Live room sync</span>
            <span><b /> Shared discovery</span>
          </div>
        </div>

        <div className="hs-room-signal" aria-hidden="true">
          <span className="hs-room-signal__ring hs-room-signal__ring--outer" />
          <span className="hs-room-signal__ring hs-room-signal__ring--middle" />
          <span className="hs-room-signal__ring hs-room-signal__ring--inner" />
          <span className="hs-room-signal__core" />
          <span className="hs-room-signal__beam" />
        </div>
      </div>

      <div className="hs-room-gateway">
        <section className="hs-room-action hs-room-action--create" aria-labelledby="create-room-heading">
          <div className="hs-room-action__topline"><span>HOST A NEW CHANNEL</span><span className="hs-room-action__status"><i /> READY</span></div>
          <h2 id="create-room-heading">Start a room</h2>
          <p>Choose how many people can join your shared listening space.</p>

          <div className="hs-capacity-control">
            <div className="hs-capacity-control__label"><span>Room capacity</span><strong>{maxUsers} people</strong></div>
            <div className="hs-capacity-grid">
              {[2, 3, 4, 5, 6, 7, 8].map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setMaxUsers(number)}
                  aria-label={`Allow up to ${number} people`}
                  aria-pressed={maxUsers === number}
                  className={maxUsers === number ? 'hs-capacity-button hs-capacity-button--active' : 'hs-capacity-button'}
                >
                  {number}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={createRoom} className="hs-primary-action hs-room-action__button">
            <span>Create room</span><span className="hs-button-arrow"><ArrowIcon /></span>
          </button>
        </section>

        <div className="hs-room-gateway__divider" aria-hidden="true"><span>or</span></div>

        <section className="hs-room-action hs-room-action--join" aria-labelledby="join-room-heading">
          <div className="hs-room-action__topline"><span>ENTER AN ACTIVE CHANNEL</span><span className="hs-room-action__status hs-room-action__status--quiet"><i /> LISTEN IN</span></div>
          <h2 id="join-room-heading">Join a room</h2>
          <p>Have an invite code? Tune in without changing your Spotify connection.</p>

          <div className="hs-join-control">
            <label htmlFor="room-code">Room code</label>
            <div className="hs-join-control__row">
              <input
                id="room-code"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="A7K2QX"
                aria-label="Room code"
                maxLength={6}
              />
              <button type="button" onClick={joinRoom} className="hs-secondary-action hs-room-action__button">
                <span>Join room</span><span className="hs-button-arrow"><ArrowIcon /></span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {error && (
        <p role="alert" className="hs-inline-error hs-room-error text-red-400 text-sm">
          {error}
        </p>
      )}
    </div>
  );

};

export default Room;
