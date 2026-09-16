import { useState } from 'react';
import ContextBlend from './ContextBlend';

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M6 3h7v7" /></svg>
);

const GameGlyph = ({ werewolf = false }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    {werewolf ? <path d="m10 2 6 6-6 10-6-10 6-6Zm0 4v8M7 10h6" /> : <path d="M3 10h8M8 6l4 4-4 4M14 4h3v12h-3" />}
  </svg>
);

const RoomLobby = ({
  roomCode,
  users,
  maxUsers,
  isHost,
  onStartGame,
  onStartWerewolf,
  onChangeHost,
  onLeaveRoom,
  selectedContext,
  onSelectContext,
  blend,
  blendError,
}) => {
  const readiness = maxUsers ? Math.min(100, Math.round((users.length / maxUsers) * 100)) : 0;
  const [werewolfNotice, setWerewolfNotice] = useState('');

  const handleStartWerewolf = () => {
    if (users.length < 4) {
      const remaining = 4 - users.length;
      const capacity = Number(maxUsers) || 0;
      const roomCapacityMessage = capacity > 0 && capacity < 4
        ? ` This room is set to ${capacity} seats, so create a room with at least 4 seats to play.`
        : ` Invite ${remaining} more ${remaining === 1 ? 'person' : 'people'} to unlock it.`;

      setWerewolfNotice(`Music Werewolf needs at least 4 players.${roomCapacityMessage}`);
      return;
    }

    setWerewolfNotice('');
    onStartWerewolf();
  };

  return (
    <div className="hs-lobby-shell w-full mx-auto">
      <div className="hs-lobby-header">
        <div className="hs-lobby-heading-row">
          <div>
            <p className="hs-room-location">HARMONYSYNC / LIVE ROOM</p>
            <h2 className="hs-lobby-title text-white text-left">Game lobby</h2>
            <p className="text-gray-400 mt-2 text-left text-sm">Tune the room before the first track drops.</p>
          </div>
          <div className="hs-lobby-header-actions">
            <div className="hs-lobby-code" aria-label={`Room code ${roomCode}`}>
              <span>ROOM CODE</span>
              <strong>{roomCode}</strong>
            </div>
            <button type="button" onClick={onLeaveRoom} className="hs-leave-room">
              <span aria-hidden="true">×</span>
              Leave room
            </button>
          </div>
        </div>
        <div className="hs-lobby-statusbar">
          <span><i className="hs-live-dot" /> {users.length < 2 ? 'Waiting for the room to fill' : 'Room is receiving players'}</span>
          <span>{users.length}/{maxUsers || '—'} connected</span>
        </div>
      </div>

      <div className="hs-lobby-layout">
        <section className="hs-lobby-people" aria-labelledby="players-heading">
          <div className="hs-lobby-section-heading">
            <div>
              <h3 id="players-heading">Players in the room</h3>
              <p>{isHost ? 'Pass the host signal to another player when you are ready.' : 'Everyone here contributes to the shared signal.'}</p>
            </div>
            <span className="hs-lobby-readiness-value">{readiness}% ready</span>
          </div>

          <div className="hs-readiness" aria-hidden="true"><span style={{ width: `${readiness}%` }} /></div>

          <div className="hs-player-list">
            {users.map((user, index) => (
              <div key={user.id} className="hs-player-row bg-slate-700/50 px-4 py-3 rounded-xl text-gray-300">
                <span className="hs-player-index">0{index + 1}</span>
                <span className="hs-player-orb" aria-hidden="true">{user.playerName?.slice(0, 1).toUpperCase()}</span>
                <span className="min-w-0 flex-1 truncate text-left font-medium">{user.playerName}</span>
                {index === 0 && <span className="hs-host-badge">host</span>}
                {isHost && index !== 0 && (
                  <button
                    type="button"
                    className="hs-player-host-action"
                    onClick={() => onChangeHost?.(user.id)}
                  >
                    Make host
                  </button>
                )}
                <span className="hs-player-signal" aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>

        <aside className="hs-lobby-controls" aria-labelledby="game-choice-heading">
          <div className="hs-lobby-section-heading hs-lobby-section-heading--controls">
            <div>
              <h3 id="game-choice-heading">Choose a game</h3>
              <p>{isHost ? 'Your room, your call.' : 'The host controls the launch.'}</p>
            </div>
            <span className="hs-control-mark" aria-hidden="true" />
          </div>

          {isHost ? (
            <div className="hs-lobby-actions">
              <button onClick={onStartGame} disabled={users.length < 2} className="hs-primary-action hs-lobby-action-button bg-green-500 hover:bg-green-400 disabled:bg-slate-600 disabled:text-gray-400 text-black font-bold py-3 px-6 rounded-xl transition">
                <span className="hs-lobby-game-label"><i className="hs-action-glyph"><GameGlyph /></i> Spotify Guess</span><span className="hs-button-arrow"><ArrowIcon /></span>
              </button>

              <button onClick={handleStartWerewolf} className="hs-secondary-action hs-werewolf-action hs-lobby-action-button bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition">
                <span className="hs-lobby-game-label"><i className="hs-action-glyph"><GameGlyph werewolf /></i> Music Werewolf</span><span className="hs-button-arrow"><ArrowIcon /></span>
              </button>
            </div>
          ) : (
            <p className="hs-host-wait text-gray-400 text-sm"><span className="hs-live-dot" /> Waiting for the host to choose a game...</p>
          )}

          {werewolfNotice && (
            <div role="alert" className="hs-capacity-notice">
              <span className="hs-capacity-notice__icon" aria-hidden="true">!</span>
              <p>{werewolfNotice}</p>
            </div>
          )}
        </aside>
      </div>

      {users.length >= 2 && (
        <ContextBlend
          isHost={isHost}
          selectedContext={selectedContext}
          onSelectContext={onSelectContext}
          blend={blend}
          error={blendError}
        />
      )}

    </div>
  );
};

export default RoomLobby;
