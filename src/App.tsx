import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import Timer from './components/Timer';
import MusicPlayer from './components/MusicPlayer';
import Settings, { TimeSettings } from './components/Settings';
import Tooltip from './components/Tooltip';

function App() {
  //----------------------------------------- UseStates ---------------------------------------------------
  const [isWorking, setIsWorking] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [spotifyPlayer, setSpotifyPlayer] = useState<Spotify.Player | null>(null);
  const [workSessionCount, setWorkSessionCount] = useState(1);
  const [breakSessionCount, setBreakSessionCount] = useState(0);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0);
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [disconnectSpotify, setDisconnectSpotify] = useState<(() => void) | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [timeSettings, setTimeSettings] = useState({
    workTime: 25,
    breakTime: 5,
    longBreakTime: 15,
    intervals: 4,
    autoplay: true,
    bellSound: true
  });
  // ------------------------------------------ REFS ------------------------------------------------------
  const [bellAudio] = useState(new Audio('/sounds/bell.mp3'));
  const spotifyPlayerRef = useRef<Spotify.Player | null>(null);
  //-------------------------------------------------------------------------------------------------------
  
  /**
   * ---------------------------------- Event Handlers ---------------------------------------------------
   */

  const playBellAndPauseSpotify = useCallback(async () => {
    if (timeSettings.bellSound) {
      if (spotifyPlayerRef.current) {
        await spotifyPlayerRef.current.pause();
      }
      
      bellAudio.currentTime = 0; // Reset audio to start
      await bellAudio.play();
      
      // Resume Spotify playback after bell sound finishes
      bellAudio.onended = () => {
        if (spotifyPlayerRef.current && timeSettings.autoplay) {
          spotifyPlayerRef.current.resume();
        }
      };
    } else if (timeSettings.autoplay && spotifyPlayerRef.current) {
      // If bell sound is off but autoplay is on, just resume Spotify
      spotifyPlayerRef.current.resume();
    }
  }, [bellAudio, timeSettings.autoplay, timeSettings.bellSound]);

  const loadSpotifySDK = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.Spotify) {
        resolve(window.Spotify);
      } else {
        window.onSpotifyWebPlaybackSDKReady = () => {
          resolve(window.Spotify);
        };
  
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        script.onerror = (error) => reject(error);
        document.body.appendChild(script);
      }
    });
  }, []);
  
  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleLogin = useCallback(() => {
    if (isAuthenticating) return; // Prevent multiple login attempts

    setIsAuthenticating(true);
    const popup = window.open('http://localhost:8888/login', 'Login with Spotify', 'width=800,height=600');
    
    if (popup) {
      popup.focus();
    } else {
      setLoginError('Please allow popups for this website to login with Spotify.');
      setIsAuthenticating(false);
    }
  }, [isAuthenticating]);

  const handleAuthError = useCallback(() => {
    setAccessToken(null);
    localStorage.removeItem('spotifyAccessToken');
    setLoginError('Authentication failed. Please try logging in again.');
    setIsAuthenticating(false);
  }, []);

  const handleLogout = useCallback(() => {
    if (spotifyPlayer) {
      spotifyPlayer.pause().then(() => {
        if (disconnectSpotify) {
          disconnectSpotify();
        }
        
        // Save timer state to localStorage
        const timerState = {
          isWorking,
          time,
          isActive,
          workSessionCount,
          breakSessionCount,
          completedWorkSessions,
          timeSettings
        };
        localStorage.setItem('timerState', JSON.stringify(timerState));
        
        // Clear Spotify related data
        setAccessToken(null);
        localStorage.removeItem('spotifyAccessToken');
        setSpotifyPlayer(null);
        setDisconnectSpotify(null);
        
        // Only way for other Spotify Apps to notice detachment 
        window.location.reload();
      });
    }
  }, [spotifyPlayer, disconnectSpotify, isWorking, time, isActive, workSessionCount, breakSessionCount, completedWorkSessions, timeSettings]);


  const handleSessionEnd = useCallback(() => {
    playBellAndPauseSpotify();

    if (isWorking) {
      const newCompletedSessions = completedWorkSessions + 1;
      setCompletedWorkSessions(newCompletedSessions);
      setIsWorking(false);
      setBreakSessionCount((prev) => prev + 1);
      
      if (newCompletedSessions % timeSettings.intervals === 0) {
        setTime(timeSettings.longBreakTime * 60);
      } else {
        setTime(timeSettings.breakTime * 60);
      }
    } else {
      setIsWorking(true);
      setWorkSessionCount((prev) => prev + 1);
      setTime(timeSettings.workTime * 60);
    }

    if (timeSettings.autoplay) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [isWorking, completedWorkSessions, timeSettings, playBellAndPauseSpotify]);

  const handleToggleTimer = () => {
    setIsActive((prev) => !prev);
  };

  const handleResetTimer = () => {
    setIsActive(false);
    if (isWorking) {
      setTime(timeSettings.workTime * 60);
    } else {
      // Check if it's a long break
      const isLongBreak = completedWorkSessions % timeSettings.intervals === 0;
      setTime(isLongBreak ? timeSettings.longBreakTime * 60 : timeSettings.breakTime * 60);
    }
  };

  const handleSkipSession = () => {
    if (isWorking) {
      const newCompletedSessions = completedWorkSessions + 1;
      setCompletedWorkSessions(newCompletedSessions);
      setIsWorking(false);
      setBreakSessionCount((prev) => prev + 1);
      setTime(newCompletedSessions % timeSettings.intervals === 0 ? timeSettings.longBreakTime * 60 : timeSettings.breakTime * 60);
    } else {
      setIsWorking(true);
      setWorkSessionCount((prev) => prev + 1);
      setTime(timeSettings.workTime * 60);
    }
    setIsActive(false);
  };

  const handleTogglePlayback = useCallback(() => {
    setIsActive((prevIsActive) => {
      const newIsActive = !prevIsActive;
      if (spotifyPlayer) {
        if (newIsActive) {
          spotifyPlayer.resume();
        } else {
          spotifyPlayer.pause();
        }
      }
      return newIsActive;
    });
  }, [spotifyPlayer]);

  const handleExternalPlaybackChange = useCallback((isPlaying: boolean) => {
    setIsActive(isPlaying);
  }, []);

  const handleSaveSettings = (newSettings: TimeSettings) => {
    setTimeSettings(newSettings);

    if (isWorking) {
      setTime(newSettings.workTime * 60);
    } else if (completedWorkSessions % timeSettings.intervals === 0) {
      setTime(newSettings.longBreakTime * 60);
    } else {
      setTime(newSettings.breakTime * 60);
    }
  };
  //------------------------------------------------------------------------------------------------------

  /*
  * ---------------------------------- useEffect ---------------------------------------------------------
  */
  useEffect(() => {
    if (accessToken && !isSDKReady) {
      loadSpotifySDK()
        .then(() => {
          setIsSDKReady(true);
        })
        .catch((error) => {
          console.error("Failed to load Spotify SDK:", error);
          setLoginError("Failed to load Spotify SDK. Please try again.");
        });
    }
  }, [accessToken, isSDKReady, loadSpotifySDK]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && time === 0) {
      handleSessionEnd();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SPOTIFY_TOKEN') {
        setAccessToken(event.data.accessToken);
        localStorage.setItem('spotifyAccessToken', event.data.accessToken);
        setLoginError(null);
        setIsAuthenticating(false);
      } else if (event.data.type === 'SPOTIFY_ERROR') {
        handleAuthError();
      }
    };
  
    window.addEventListener('message', handleMessage);
  
    // Check for stored token on component mount
    const storedToken = localStorage.getItem('spotifyAccessToken');
    if (storedToken) {
      setAccessToken(storedToken);
    }
  
    // Restore timer state if available
    const storedTimerState = localStorage.getItem('timerState');
    if (storedTimerState) {
      const {
        isWorking: storedIsWorking,
        time: storedTime,
        isActive: storedIsActive,
        workSessionCount: storedWorkSessionCount,
        breakSessionCount: storedBreakSessionCount,
        completedWorkSessions: storedCompletedWorkSessions,
        timeSettings: storedTimeSettings
      } = JSON.parse(storedTimerState);
  
      setIsWorking(storedIsWorking);
      setTime(storedTime);
      setIsActive(storedIsActive);
      setWorkSessionCount(storedWorkSessionCount);
      setBreakSessionCount(storedBreakSessionCount);
      setCompletedWorkSessions(storedCompletedWorkSessions);
      setTimeSettings(storedTimeSettings);
  
      // Clear the stored timer state
      localStorage.removeItem('timerState');
    }
  
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleAuthError]);
  //-------------------------------------------------------------------------------------------------------

  /**
   * ---------------------------------- JSX ---------------------------------------------------------------
   */
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-5xl font-poppins text-center text-white mb-12">
          pomodorify
        </h1>
        <div className="relative">
          <Timer 
            time={time}
            isActive={isActive}
            isWorking={isWorking}
            onToggleTimer={handleToggleTimer}
            onResetTimer={handleResetTimer}
            onSkipSession={handleSkipSession}
          />
          <button 
            onClick={openSettings}
            className="absolute top-2 right-2 text-white hover:text-gray-300 transition-colors"
          >
            <SettingsIcon size={28} />
          </button>
        </div>
        <div className="bg-gray-800 rounded-full px-6 py-2 mb-6">
          <p className="text-center text-white font-semibold">
            {isWorking 
              ? `Work Session #${workSessionCount}` 
              : `${completedWorkSessions % timeSettings.intervals === 0 ? 'Long' : 'Short'} Break #${breakSessionCount}`}
          </p>
        </div>
        {loginError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{loginError}</span>
          </div>
        )}
        {!accessToken ? (
          <Tooltip text="Requires Spotify Premium">
          <button 
            onClick={handleLogin} 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
            disabled={isAuthenticating}
          >
            {isAuthenticating ? 'Logging in...' : 'Login with Spotify'}
          </button>
        </Tooltip>
        ) : (
          <>
            {isSDKReady ? (
              <MusicPlayer 
                accessToken={accessToken} 
                setPlayer={setSpotifyPlayer} 
                setDisconnectFunction={setDisconnectSpotify}
                isActive={isActive} 
                onAuthError={handleAuthError}
                onTogglePlayback={handleTogglePlayback}
                onExternalPlaybackChange={handleExternalPlaybackChange}
              />
            ) : (
              <div className="text-white text-center mb-4">Loading Spotify SDK...</div>
            )}
            <button 
              onClick={handleLogout} 
              className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
            >
              Logout from Spotify
            </button>
          </>
        )}
        <Settings 
          isOpen={isSettingsOpen}
          onClose={closeSettings}
          onSaveSettings={handleSaveSettings}
          initialSettings={timeSettings}
          />
      </div>
    </div>
  );
}

export default App;