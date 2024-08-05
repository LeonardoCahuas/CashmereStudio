import React, { useState, useEffect } from 'react';
import { storage, ref, getDownloadURL } from '../../firebase-config';
import header from '../../assets/mem.png';
import header2 from '../../assets/cashead.png';
import './Header.css'; // Assumi che Header.css contenga gli stili necessari
import videodesk from '../../../src/assets/Videos/VIDEOHOME.mp4'
import videomob from '../../../src/assets/Videos/TUTTO_VERTICALE.mp4'
function Header() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        const fetchVideoUrl = async () => {
            const videoRef = ref(storage, isMobile ? "TUTTO_VERTICALE.mp4" : 'VIDEOHOME.mp4');
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
        <div className="w-100 header bg-black">
            <>
                <video
                    className="video-bg"
                    autoPlay
                    playsInline
                    loop
                    muted
                    controls={false}
                    disablePictureInPicture
                    style={{ width: "100vw" }}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <source src={isMobile ? videomob : videodesk} type="video/mp4" />
                    Il tuo browser non supporta il tag video.
                </video>
            </>

        </div>
    );
}

export default Header;