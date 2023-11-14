import React, {useEffect} from "react";

const SpotifyAuth = () => {
    const CLIENT_ID = "30a645b392a841129954664047e4b6cf";
    const REDIRECT_URI = "http://localhost:3000/callback";
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

    const getAccessToken = (hash: string): Token | undefined => { 
        const stringAfterHashtag = hash.substring(1);
        const paramsInUrl = stringAfterHashtag.split("&");
        return paramsInUrl.reduce((accumulator: any, currentValue) => {
            const [key, value] = currentValue.split("=");
            accumulator[key] = value;
            return accumulator;
        }, {});
    }

    type Token = {
        access_token: string;
        token_type: string;
        expires_in: string;
    }

    useEffect(() => {
        const tokenInfo: Token | undefined = window.location.hash ? getAccessToken(window.location.hash) : undefined;
        if (tokenInfo) {
            //TODO: Add a better way to store the token
            localStorage.clear();
            localStorage.setItem("access_token", tokenInfo.access_token);
            localStorage.setItem("token_type", tokenInfo.token_type);
            localStorage.setItem("expires_in", tokenInfo.expires_in);
        }
    })

    return (
        <div className="spotify-auth">
            <button className="btn btn-success btn-lg" onClick={handleLogin}>
                Login to Spotify
            </button>
        </div>
    );

}

export default SpotifyAuth;