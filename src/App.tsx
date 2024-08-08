import React, { useState, useEffect } from 'react';
import Timer from './components/Timer';
import MusicPlayer from './components/MusicPlayer';

function App() {
  const [isWorking, setIsWorking] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes
  const [accessToken, setAccessToken] = useState('');
  const [spotifyPlayer, setSpotifyPlayer] = useState<Spotify.Player | null>(null);

  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'SPOTIFY_TOKEN') {
        setAccessToken(event.data.accessToken);
      }
    });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsWorking(!isWorking);
      setIsActive(false);
      setTime(isWorking ? 5 * 60 : 25 * 60);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, isWorking]);

  const handleLogin = () => {
    const popup = window.open('http://localhost:8888/login', 'Login with Spotify', 'width=800,height=600');
  };

  const handleToggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleResetTimer = () => {
    setIsActive(false);
    setTime(isWorking ? 25 * 60 : 5 * 60);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          Pomodorify
        </h1>
        <Timer 
          time={time}
          isActive={isActive}
          onToggleTimer={handleToggleTimer}
          onResetTimer={handleResetTimer}
        />
        <p className="text-center text-white mb-6">
          {isWorking ? 'Work Session' : 'Break Session'}
        </p>
        {!accessToken ? (
          <button 
            onClick={handleLogin} 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
          >
            Login with Spotify
          </button>
        ) : (
          <MusicPlayer accessToken={accessToken} setPlayer={setSpotifyPlayer} isActive={isActive} />
        )}
      </div>
    </div>
  );
}

export default App;