import React, { useState, useEffect } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

interface MusicPlayerProps {
  accessToken: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ accessToken }) => {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isActive, setIsActive] = useState(false);
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

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('player_state_changed', (state) => {
        if (!state) {
          return;
        }

        setCurrentTrack(state.track_window.current_track);
        setIsPaused(state.paused);

        player.getCurrentState().then(state => {
          setIsActive(!!state);
        });
      });

      player.connect();
    };
  }, [accessToken]);

  const handlePlayPause = () => {
    player?.togglePlay();
  };

  const handleNextTrack = () => {
    player?.nextTrack();
  };

  const handlePreviousTrack = () => {
    player?.previousTrack();
  };

  if (!isActive) {
    return (
      <div className="container">
        <div className="main-wrapper">
          <b> ERROR: Instance not active.</b>
        </div>
      </div>
    );
  }

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