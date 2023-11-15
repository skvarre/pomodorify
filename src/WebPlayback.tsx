import { useEffect } from "react";

type WebPlaybackProps = {
    token: string | null;
};


const WebPlayback: React.FC<WebPlaybackProps> = ( {token} ) => {
    
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);  

        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb(token ?? ''); },
                volume: 0.5
            });
        };
        
    });

    return (
        <>
            <div className="container">
                <div className="main-wrapper">
                    
                    <h1>Web Playback SDK</h1>
                </div>
            </div>
        </>
    );
}

export default WebPlayback;