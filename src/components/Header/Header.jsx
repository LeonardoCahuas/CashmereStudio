import React, { useState, useEffect } from 'react';
import { storage, ref, getDownloadURL } from '../../firebase-config';
import header from '../../assets/mem.png';
import header2 from '../../assets/cashead.png';
import './Header.css'; // Assumi che Header.css contenga gli stili necessari

function Header() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        const fetchVideoUrl = async () => {
            const videoRef = ref(storage, 'VIDEOHOME.mp4');
            try {
                const url = await getDownloadURL(videoRef);
                setVideoUrl(url);
                
            } catch (error) {
                console.error('Error fetching video URL:', error);
            }
        };

        fetchVideoUrl();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 602);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Call initially to set the correct state

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="w-100 header bg-white">
            {isMobile ? (
                <img
                    src={header}
                    className="w-100"
                    style={{ height: 'auto' }}
                    alt="Header"
                />
            ) : (
                <>
                    {videoUrl && (
                        <video className="video-bg" autoPlay loop muted style={{width:"100vw"}}>
                            <source src={videoUrl} type="video/mp4" />
                            Il tuo browser non supporta il tag video.
                        </video>
                    )}
                    <div
                        className="w-100"
                        style={{ height: '1000px', display: videoUrl ? 'none' : 'block', backgroundColor:"black" }}
                        alt="Header"
                    >
                    </div>
                </>
            )}
        </div>
    );
}

export default Header;
