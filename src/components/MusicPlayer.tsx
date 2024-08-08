import React, { useState, useEffect } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

interface MusicPlayerProps {
  accessToken: string;
  setPlayer: (player: Spotify.Player) => void;
  isActive: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ accessToken, setPlayer, isActive }) => {
  const [isPaused, setIsPaused] = useState(!isActive);
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track | null>(null);

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
        spotifyApi.transferMyPlayback([device_id]);
      });

      player.addListener('player_state_changed', (state) => {
        if (!state) {
          return;
        }

        setCurrentTrack(state.track_window.current_track);
        setIsPaused(state.paused);
      });

      player.connect();
    };
  }, [accessToken, setPlayer]);

  useEffect(() => {
    if (isActive && isPaused) {
      spotifyApi.play();
    } else if (!isActive && !isPaused) {
      spotifyApi.pause();
    }
  }, [isActive, isPaused]);

  const handlePlayPause = () => {
    if (isPaused) {
      spotifyApi.play();
    } else {
      spotifyApi.pause();
    }
  };

  const handleNextTrack = () => {
    spotifyApi.skipToNext();
  };

  const handlePreviousTrack = () => {
    spotifyApi.skipToPrevious();
  };

  return (
    <div className="container mt-4">
      <div className="main-wrapper">
        <img src={currentTrack?.album.images[0].url} className="now-playing__cover" alt="" />
        <div className="now-playing__side">
          <div className="now-playing__name">{currentTrack?.name}</div>
          <div className="now-playing__artist">{currentTrack?.artists[0].name}</div>
        </div>

        <button className="btn-spotify" onClick={handlePreviousTrack}>
          &lt;&lt;
        </button>

        <button className="btn-spotify" onClick={handlePlayPause}>
          {isPaused ? "PLAY" : "PAUSE"}
        </button>

        <button className="btn-spotify" onClick={handleNextTrack}>
          &gt;&gt;
        </button>
      </div>
    </div>
  );
}

export default MusicPlayer;