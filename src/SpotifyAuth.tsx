const SpotifyAuth = () => {
    const CLIENT_ID = "30a645b392a841129954664047e4b6cf";
    const REDIRECT_URI = "http://localhost:3000";
    const SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
    const scopes = [
        "user-read-currently-playing",
        "user-read-playback-state",
        "streaming",
    ];
    const SCOPES_URL_PARAM = scopes.join("%20");

    const spotifyAuthUrl = `${SPOTIFY_AUTHORIZE_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES_URL_PARAM}&response_type=token&show_dialog=true`;

    const handleLogin = () => {
        window.location.href = spotifyAuthUrl;
    };

    return (
        <div className="spotify-auth">
            <button className="btn btn-success btn-lg" onClick={handleLogin}>
                Login to Spotify
            </button>
        </div>
    );

}





export default SpotifyAuth;