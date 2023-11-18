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

    
  //Clear localstorage on page refresh
  useEffect(() => {
    localStorage.clear();
  }, []);
  


return (
    <div className="">
      <header className="">
        {(token === '') ? <SpotifyAuth /> : <WebPlayback token={token} /> }
      </header>
    </div>
  );
}

export default App;
