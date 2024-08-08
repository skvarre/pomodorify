import React, { useState, useEffect } from 'react';
import Timer from './components/Timer';
import MusicPlayer from './components/MusicPlayer';

function App() {
  const [isWorking, setIsWorking] = useState(true);
  const workTime = 25 * 60; // 25 minutes
  const breakTime = 5 * 60; // 5 minutes
  const [accessToken, setAccessToken] = useState('');

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
  };

  const handleSkip = () => {
    setIsWorking(!isWorking);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Pomodorify
      </h1>
      <Timer 
        initialTime={isWorking ? workTime : breakTime} 
        onTimerEnd={handleTimerEnd} 
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
        <MusicPlayer accessToken={accessToken} />
      )}
    </div>
  );
}

export default App;