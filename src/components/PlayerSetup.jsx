import { useState } from 'react';

const PlayerSetup = ({ onContinue, nameTaken, onNameChange }) => {
  const [playerName, setPlayerName] = useState('');

  const handleContinue = () => {
    const trimmedName = playerName.trim();

    if (!trimmedName) {
      return;
    }

    onContinue(trimmedName);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-xl text-center">

      <h1 className="text-3xl font-bold text-white mb-3">
        What's your name?
      </h1>

      <p className="text-gray-400 mb-6">
        Choose the name your friends will see.
      </p>

      <input
        type="text"
        value={playerName}
        onChange={(e) => {
            setPlayerName(e.target.value);
            onNameChange();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleContinue();
          }
        }}
        placeholder="Enter your name"
        maxLength={20}
        className="w-full bg-slate-700 text-white placeholder-gray-400 px-4 py-3 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-green-500"
      />

      {nameTaken && (
        <p className="text-red-400 text-sm mb-4">
            That name is already taken. Please choose another name.
        </p>
        )}

      <button
        onClick={handleContinue}
        disabled={!playerName.trim()}
        className="w-full bg-green-500 hover:bg-green-400 disabled:bg-slate-600 disabled:text-gray-400 text-black font-bold py-3 px-6 rounded-xl transition"
      >
        Continue
      </button>

    </div>
  );
};

export default PlayerSetup;