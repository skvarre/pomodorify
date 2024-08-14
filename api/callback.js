const axios = require('axios');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://your-app-name.vercel.app/api/callback';

module.exports = async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = response.data.access_token;
    res.send(`
      <script>
        window.opener.postMessage({ type: 'SPOTIFY_TOKEN', accessToken: '${accessToken}' }, '*');
        window.close();
      </script>
    `);
  } catch (error) {
    res.status(400).send('Error getting token');
  }
};