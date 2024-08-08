import React, { useState, useEffect } from 'react';
import Timer from './components/Timer';
import MusicPlayer from './components/MusicPlayer';

function App() {
  const [isWorking, setIsWorking] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const workTime = 25 * 60; // 25 minutes
  const breakTime = 5 * 60; // 5 minutes
  const [accessToken, setAccessToken] = useState('');
  const [spotifyPlayer, setSpotifyPlayer] = useState<Spotify.Player | null>(null);

  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'SPOTIFY_TOKEN') {
        setAccessToken(event.data.accessToken);
      }
    });
  }, []);

  const handleLogin = () => {
    const popup = window.open('http://localhost:8888/login', 'Login with Spotify', 'width=800,height=600');
  };

  const handleTimerEnd = () => {
    setIsWorking(!isWorking);
    setIsActive(false);
    if (spotifyPlayer) {
      spotifyPlayer.pause();
    }
  };

  const handleSkip = () => {
    setIsWorking(!isWorking);
    setIsActive(false);
    if (spotifyPlayer) {
      spotifyPlayer.pause();
    }
  };

  const handleToggleTimer = () => {
    setIsActive(!isActive);
    if (spotifyPlayer) {
      if (isActive) {
        spotifyPlayer.pause();
      } else {
        spotifyPlayer.resume();
      }
    }
  };

  const handleResetTimer = () => {
    setIsActive(false);
    if (spotifyPlayer) {
      spotifyPlayer.pause();
      // Optionally, you could seek to the beginning of the current track
      // spotifyPlayer.seek(0);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Pomodorify
      </h1>
      <Timer 
        initialTime={isWorking ? workTime : breakTime} 
        onTimerEnd={handleTimerEnd}
        isActive={isActive}
        onToggleTimer={handleToggleTimer}
        onResetTimer={handleResetTimer}
      />
      <p className="text-center mt-4">
        {isWorking ? 'Work Session' : 'Break Session'}
      </p>
      <button 
        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded block mx-auto"
        onClick={handleSkip}
      >
        {isWorking ? 'Skip to Break' : 'Skip to Work'}
      </button>
      {!accessToken ? (
        <button onClick={handleLogin} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block mx-auto">
          Login with Spotify
        </button>
      ) : (
        <MusicPlayer accessToken={accessToken} setPlayer={setSpotifyPlayer} isActive={isActive} />
      )}
    </div>
  );
}

export default App;