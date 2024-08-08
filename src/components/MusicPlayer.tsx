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
  const [initializationStep, setInitializationStep] = useState('Starting initialization');

  const handleApiError = useCallback((error: any) => {
    console.error('Spotify API Error:', error);
    let errorMessage = 'An unknown error occurred';
    if (error.response) {
      errorMessage = `Spotify API error: ${error.response.status} - ${error.response.message}`;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    setError(errorMessage);
  }, []);

  const initializeSpotifyPlayer = useCallback(() => {
    console.log('Initializing Spotify player...');
    setInitializationStep('Creating Spotify player');

    if (!window.Spotify) {
      console.error('Spotify SDK not loaded');
      setError('Spotify SDK not loaded. Please refresh the page.');
      return;
    }

    const player = new window.Spotify.Player({
      name: 'Pomodorify Web Player',
      getOAuthToken: cb => { 
        console.log('Getting OAuth token...');
        cb(accessToken); 
      },
      volume: 0.5
    });

    player.addListener('ready', ({ device_id }) => {
      console.log('Spotify player ready with Device ID:', device_id);
      setInitializationStep('Transferring playback');
      spotifyApi.transferMyPlayback([device_id])
        .then(() => {
          console.log('Playback transferred successfully');
          setInitializationStep('Playback transferred');
        })
        .catch(error => {
          console.error('Error transferring playback:', error);
          setInitializationStep('Error transferring playback');
          handleApiError(error);
        });
    });

    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline:', device_id);
      setError('Spotify player is not ready. Please try again.');
    });

    player.addListener('player_state_changed', (state) => {
      if (!state) {
        console.log('Player state changed to null');
        return;
      }
      console.log('Player state changed:', state);
      setCurrentTrack(state.track_window.current_track);
    });

    player.addListener('initialization_error', ({ message }) => {
      console.error('Initialization error:', message);
      setError(`Initialization error: ${message}`);
    });

    player.addListener('authentication_error', ({ message }) => {
      console.error('Authentication error:', message);
      setError(`Authentication error: ${message}`);
    });

    player.addListener('account_error', ({ message }) => {
      console.error('Account error:', message);
      setError(`Account error: ${message}`);
    });

    setInitializationStep('Connecting to Spotify');
    player.connect()
      .then(success => {
        if (success) {
          console.log('Spotify Web Playback SDK connected successfully');
          setInitializationStep('Connected successfully');
        } else {
          console.error('Failed to connect to Spotify');
          setError('Failed to connect to Spotify. Please try again.');
          setInitializationStep('Connection failed');
        }
      })
      .catch(error => {
        console.error('Error connecting to Spotify:', error);
        setInitializationStep('Error during connection');
        handleApiError(error);
      });

    setPlayer(player);
  }, [accessToken, setPlayer, handleApiError]);

  useEffect(() => {
    if (!accessToken) {
      console.log('No access token available');
      return;
    }

    console.log('Setting access token:', accessToken);
    spotifyApi.setAccessToken(accessToken);
    
    initializeSpotifyPlayer();

    return () => {
      // Cleanup logic if needed
    };
  }, [accessToken, initializeSpotifyPlayer]);

  useEffect(() => {
    if (currentTrack && spotifyApi.getAccessToken()) {
      if (isActive) {
        console.log('Attempting to play...');
        spotifyApi.play().catch(handleApiError);
      } else {
        console.log('Attempting to pause...');
        spotifyApi.pause().catch(handleApiError);
      }
    }
  }, [isActive, currentTrack, handleApiError]);

  const handleNextTrack = () => {
    if (spotifyApi.getAccessToken()) {
      console.log('Skipping to next track...');
      spotifyApi.skipToNext().catch(handleApiError);
    }
  };

  const handlePreviousTrack = () => {
    if (spotifyApi.getAccessToken()) {
      console.log('Skipping to previous track...');
      spotifyApi.skipToPrevious().catch(handleApiError);
    }
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!currentTrack) {
    return <div className="text-white text-center">
      Initializing Spotify player...
      <br />
      Current step: {initializationStep}
    </div>;
  }

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="flex items-center space-x-4">
        <img 
          src={currentTrack.album.images[0].url} 
          className="w-20 h-20 rounded-md shadow-md" 
          alt={currentTrack.album.name || "Album cover"} 
        />
        <div className="flex-grow">
          <div className="font-bold truncate">{currentTrack.name}</div>
          <div className="text-gray-400 text-sm truncate">{currentTrack.artists[0].name}</div>
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