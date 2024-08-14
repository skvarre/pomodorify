const querystring = require('querystring');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://pomodorify.vercel.app/api/callback';

module.exports = (req, res) => {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state',
      redirect_uri: REDIRECT_URI,
    }));
};