import { useEffect } from "react";

const WebPlayback = ( ) => {
    
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
    });
}