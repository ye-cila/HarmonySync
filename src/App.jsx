import { useState, useEffect } from 'react';

function App() {
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    // Receive Token from URL after Spotify redirect to frontend
    const query = new URLSearchParams(window.location.search);
    const token = query.get('access_token');

    if (token) {
      setAccessToken(token);
      // Format URL
      window.history.pushState({}, null, '/');
    }
  }, []);

  const handleLogin = () => {
    // Redirect to /login in Backend
    window.location.href = 'http://127.0.0.1:8888/login';
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6 text-green-500">HarmonySync</h1>
      
      {!accessToken ? (
        <div className="text-center">
          <p className="mb-6 text-gray-400">Log in with Spotify to fully experience HarmonySync.</p>
          <button
            onClick={handleLogin}
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded-full transition duration-300"
          >
            Log in with Spotify
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xl text-green-400 font-semibold mb-2">🎉 Spotify connected!</p>
          <div className="bg-gray-900 p-4 rounded-lg max-w-md break-all text-xs text-gray-300 border border-gray-800">
            <strong>Access Token:</strong> {accessToken}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;