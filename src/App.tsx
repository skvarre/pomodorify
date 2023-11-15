import React, {useEffect, useState} from 'react';
import SpotifyAuth from './SpotifyAuth';
import WebPlayback from './WebPlayback';

function App() {
  const [token, setToken] = useState<string | null>('');

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setToken(token);
    }
  }, []);

  //Clear the token if it is expired
  useEffect(() => {
    const expiresIn = localStorage.getItem("expires_in");
    if (expiresIn) {
      setTimeout(() => {
        localStorage.clear();
        setToken('');
      }, Number(expiresIn) * 1000);
    }
  }, [token]);
  

return (
    <div className="">
      <header className="">
        {(token === '') ? <SpotifyAuth /> : <WebPlayback token={token} /> }
      </header>
    </div>
  );
}

export default App;
