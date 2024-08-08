import React, { useState, useEffect, useCallback } from 'react';
import Timer from './components/Timer';
import MusicPlayer from './components/MusicPlayer';

function App() {
  const [isWorking, setIsWorking] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes
  const [accessToken, setAccessToken] = useState('');
  const [spotifyPlayer, setSpotifyPlayer] = useState<Spotify.Player | null>(null);
  const [workSessionCount, setWorkSessionCount] = useState(1);
  const [breakSessionCount, setBreakSessionCount] = useState(0);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  const loadSpotifySDK = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.Spotify) {
        setSdkReady(true);
        resolve();
      } else {
        window.onSpotifyWebPlaybackSDKReady = () => {
          setSdkReady(true);
          resolve();
        };
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        script.onerror = () => reject(new Error("Failed to load Spotify SDK"));
        document.body.appendChild(script);
      }
    });
  }, []);

  useEffect(() => {
    loadSpotifySDK().catch(error => {
      console.error("Failed to load Spotify SDK:", error);
      setLoginError("Failed to load Spotify SDK. Please refresh the page.");
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SPOTIFY_TOKEN') {
        console.log("Received Spotify token");
        setAccessToken(event.data.accessToken);
        setLoginError(null);
        localStorage.setItem('spotifyAccessToken', event.data.accessToken);
      } else if (event.data.type === 'SPOTIFY_ERROR') {
        console.error("Spotify login error:", event.data.error);
        setLoginError(event.data.error);
        setAccessToken('');
        localStorage.removeItem('spotifyAccessToken');
      }
    };

    window.addEventListener('message', handleMessage);

    const storedToken = localStorage.getItem('spotifyAccessToken');
    if (storedToken) {
      console.log("Found stored token, validating...");
      fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      }).then(response => {
        if (response.ok) {
          console.log("Stored token is valid");
          setAccessToken(storedToken);
        } else {
          console.log("Stored token is invalid, removing");
          localStorage.removeItem('spotifyAccessToken');
        }
      }).catch((error) => {
        console.error("Error validating stored token:", error);
        localStorage.removeItem('spotifyAccessToken');
      });
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [loadSpotifySDK]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      handleSessionEnd();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);

  const handleSessionEnd = () => {
    setIsActive(false);
    if (isWorking) {
      setIsWorking(false);
      setBreakSessionCount(prev => prev + 1);
      setTime(5 * 60); // 5 minutes break
    } else {
      setIsWorking(true);
      setWorkSessionCount(prev => prev + 1);
      setTime(25 * 60); // 25 minutes work
    }
  };

  const handleLogin = () => {
    const popup = window.open('http://localhost:8888/login', 'Login with Spotify', 'width=800,height=600');
    if (popup) {
      popup.focus();
    } else {
      setLoginError('Please allow popups for this website to login with Spotify.');
    }
  };

  const handleLogout = () => {
    setAccessToken('');
    localStorage.removeItem('spotifyAccessToken');
  };

  const handleToggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleResetTimer = () => {
    setIsActive(false);
    setTime(isWorking ? 25 * 60 : 5 * 60);
  };

  const handleSkipSession = () => {
    handleSessionEnd();
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
          isWorking={isWorking}
          onToggleTimer={handleToggleTimer}
          onResetTimer={handleResetTimer}
          onSkipSession={handleSkipSession}
        />
        <div className="bg-gray-800 rounded-full px-6 py-2 mb-6">
          <p className="text-center text-white font-semibold">
            {isWorking 
              ? `Work Session #${workSessionCount}` 
              : `Break Session #${breakSessionCount}`}
          </p>
        </div>
        {loginError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{loginError}</span>
          </div>
        )}
        {!sdkReady && (
          <div className="text-yellow-300 text-center mb-4">
            Loading Spotify SDK...
          </div>
        )}
        {sdkReady && !accessToken ? (
          <button 
            onClick={handleLogin} 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
          >
            Login with Spotify
          </button>
        ) : sdkReady && accessToken ? (
          <>
            <MusicPlayer accessToken={accessToken} setPlayer={setSpotifyPlayer} isActive={isActive} />
            <button 
              onClick={handleLogout} 
              className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
            >
              Logout from Spotify
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default App;