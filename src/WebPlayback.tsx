import { useEffect, useState } from "react";

type WebPlaybackProps = {
    token: string | null;
};

type Track = {
    name: string;
    album: {
        images: [
            { url: string }
        ]
    };
    artists: [
        { name: string }
    ];
};

const track: Track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
};


const WebPlayback: React.FC<WebPlaybackProps> = ( {token} ) => {
    const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [current_track, setTrack] = useState(track);
    
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
            
            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });
    
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });
    
    
            player.connect();            

        };


        
    }, [token]);

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