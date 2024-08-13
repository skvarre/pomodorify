import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SkipBack, SkipForward, Play, Pause } from 'lucide-react';

interface MusicPlayerProps {
  accessToken: string;
  setPlayer: (player: Spotify.Player) => void;
  setDisconnectFunction: (disconnect: () => void) => void;
  isActive: boolean;
  onAuthError: () => void;
  onTogglePlayback: () => void;
  onExternalPlaybackChange: (isActive: boolean) => void;
}

interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
}

const MusicPlayer: React.FC<MusicPlayerProps> = React.memo(({ accessToken, setPlayer, setDisconnectFunction, isActive, onAuthError, onTogglePlayback, onExternalPlaybackChange }) => {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const deviceIdRef = useRef<string | null>(null);
  const playerRef = useRef<Spotify.Player | null>(null);

  const spotifyFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          onAuthError();
          return null;
        }
        throw new Error(`Spotify API error: ${response.status}`);
      }
  
      const text = await response.text();
      // console.log('Spotify API response:', text);
  
      if (!text) {
        return null;
      }
  
      try {
        return JSON.parse(text);
      } catch (parseError) {
        // console.log('Response is not JSON, returning raw text');
        return text;
      }
    } catch (error) {
      console.error('Spotify API Error:', error);
      // setError('Failed to communicate with Spotify. Please try again.');
      // return null;
    }
  }, [accessToken, onAuthError]);

  const disconnectPlayer = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.disconnect();
      playerRef.current = null;
    }
    setCurrentTrack(null);
    setIsPlaying(false);
  }, []);

  const getCurrentPlayback = useCallback(async () => {
    const data = await spotifyFetch('/me/player');
    if (data && data.item) {
      setCurrentTrack(data.item);
      setIsPlaying(data.is_playing);
    } else {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  }, [spotifyFetch]);

  const togglePlayback = useCallback(async () => {
    const response = await spotifyFetch(`/me/player/${isPlaying ? 'pause' : 'play'}`, { method: 'PUT' });
    if (response !== null) {
      // If the response is a string (non-JSON), consider it a success
      if (typeof response === 'string' || response === '') {
        setIsPlaying(!isPlaying);
        // console.log('Playback toggled successfully');
      } else {
        console.log('Unexpected response:', response);
      }
    } else {
      console.error('Failed to toggle playback');
    }
  }, [isPlaying, spotifyFetch]);


  const handleTogglePlayback = useCallback(() => {
    onTogglePlayback();
    togglePlayback();
  }, [onTogglePlayback, togglePlayback]);

  const handleTrackChange = useCallback(async (direction: 'next' | 'previous') => {
    await spotifyFetch(`/me/player/${direction}`, { method: 'POST' });
    await getCurrentPlayback();
  }, [spotifyFetch, getCurrentPlayback]);

  const initializeSpotifyPlayer = useCallback(() => {
    if (!window.Spotify) {
      console.error('Spotify SDK not loaded');
      setError('Spotify SDK not loaded. Please refresh the page.');
      return;
    }

    if (playerRef.current) {
      console.log('Spotify player already initialized');
      return;
    }

    const player = new window.Spotify.Player({
      name: 'Pomodorify Web Player',
      getOAuthToken: cb => cb(accessToken),
      volume: 0.5
    });

    player.addListener('ready', ({ device_id }) => {
      console.log('Spotify player ready');
      deviceIdRef.current = device_id;
      spotifyFetch('/me/player', {
        method: 'PUT',
        body: JSON.stringify({ device_ids: [device_id], play: false })
      }).then(getCurrentPlayback);
    });

    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline:', device_id);
      setError('Spotify player is not ready. Please try again.');
    });

    player.addListener('player_state_changed', (state) => {
      if (state) {
        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
      }
    });

    player.connect();
    playerRef.current = player;
    setPlayer(player);
  }, [accessToken, setPlayer, spotifyFetch, getCurrentPlayback]);

  useEffect(() => {
    setDisconnectFunction(disconnectPlayer);
  }, [disconnectPlayer, setDisconnectFunction]);

  useEffect(() => {
    if (accessToken && window.Spotify && !playerRef.current) {
      initializeSpotifyPlayer();
    }
  }, [accessToken, initializeSpotifyPlayer]);

  useEffect(() => {
    if (accessToken && deviceIdRef.current) {
      getCurrentPlayback();
      const interval = setInterval(getCurrentPlayback, 5000);
      return () => clearInterval(interval);
    }
  }, [accessToken, getCurrentPlayback]);

  useEffect(() => {
    if (isActive !== isPlaying && deviceIdRef.current) {
      togglePlayback();
    }
  }, [isActive, isPlaying, togglePlayback]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.addListener('player_state_changed', (state) => {
        if (state) {
          setCurrentTrack(state.track_window.current_track);
          setIsPlaying(!state.paused);
          // Notify App component about external playback changes
          onExternalPlaybackChange(!state.paused);
        }
      });
    }
  }, [onExternalPlaybackChange]);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!window.Spotify) {
    return <div className="text-white text-center">Loading Spotify SDK...</div>;
  }

  if (!currentTrack) {
    return <div className="text-white text-center">No active playback. Please start playing a track on Spotify.</div>;
  }

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="flex items-center space-x-4">
        <img 
          src={currentTrack.album.images[0]?.url} 
          className="w-20 h-20 rounded-md shadow-md" 
          alt={currentTrack.album.name || "Album cover"} 
        />
        <div className="flex-grow flex flex-col min-w-0">
          <div className="font-bold leading-tight break-words">{currentTrack.name}</div>
          <div className="text-gray-400 text-sm truncate">{currentTrack.artists[0]?.name}</div>
          <div className="flex items-center mt-4 ml-16">
            <button onClick={() => handleTrackChange('previous')} className="focus:outline-none">
              <SkipBack className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
            </button>
            <button onClick={handleTogglePlayback} className="ml-8 focus:outline-none">
              {isActive ? (
                <Pause className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
              ) : (
                <Play className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
              )}
            </button>
            <button onClick={() => handleTrackChange('next')} className="focus:outline-none">
              <SkipForward className="ml-8 w-6 h-6 text-gray-400 hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MusicPlayer;