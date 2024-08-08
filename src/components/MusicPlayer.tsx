import React, { useState, useEffect, useCallback } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import { SkipBack, SkipForward } from 'lucide-react';

const spotifyApi = new SpotifyWebApi();

interface MusicPlayerProps {
  accessToken: string;
  setPlayer: (player: Spotify.Player) => void;
  isActive: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ accessToken, setPlayer, isActive }) => {
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApiError = useCallback((error: any) => {
    console.error('Spotify API Error:', error);
    setError('An error occurred with the Spotify player. Please try again.');
  }, []);

  const safeApiCall = useCallback(async (apiMethod: () => Promise<any>) => {
    try {
      const response = await apiMethod();
      return response;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  }, [handleApiError]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new Spotify.Player({
        name: 'Pomodorify Web Player',
        getOAuthToken: cb => { cb(accessToken); },
        volume: 0.5
      });

      setPlayer(player);

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        spotifyApi.setAccessToken(accessToken);
        safeApiCall(() => spotifyApi.transferMyPlayback([device_id]));
      });

      player.addListener('player_state_changed', (state) => {
        if (!state) {
          return;
        }

        setCurrentTrack(state.track_window.current_track);
      });

      player.connect().then(success => {
        if (!success) {
          setError('Failed to connect to Spotify. Please try again.');
        }
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [accessToken, setPlayer, safeApiCall]);

  useEffect(() => {
    if (isActive) {
      safeApiCall(() => spotifyApi.play());
    } else {
      safeApiCall(() => spotifyApi.pause());
    }
  }, [isActive, safeApiCall]);

  const handleNextTrack = () => {
    safeApiCall(() => spotifyApi.skipToNext());
  };

  const handlePreviousTrack = () => {
    safeApiCall(() => spotifyApi.skipToPrevious());
  };

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="flex items-center space-x-4">
        <img 
          src={currentTrack?.album.images[0].url} 
          className="w-20 h-20 rounded-md shadow-md" 
          alt={currentTrack?.album.name || "Album cover"} 
        />
        <div className="flex-grow">
          <div className="font-bold truncate">{currentTrack?.name || "No track playing"}</div>
          <div className="text-gray-400 text-sm truncate">{currentTrack?.artists[0].name || "Unknown artist"}</div>
          <div className="flex items-center justify-between mt-2">
            <button onClick={handlePreviousTrack} className="focus:outline-none">
              <SkipBack className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
            </button>
            <button onClick={handleNextTrack} className="focus:outline-none">
              <SkipForward className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;