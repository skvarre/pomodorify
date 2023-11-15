import React, {useEffect, useState} from 'react';
import SpotifyAuth from './SpotifyAuth';

function App() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setToken(token);
    }
  }, []);

return (
    <div className="">
      <header className="">
        {(token === '') ? <SpotifyAuth /> : <h1>Logged in</h1> }
      </header>
    </div>
  );
}

export default App;
