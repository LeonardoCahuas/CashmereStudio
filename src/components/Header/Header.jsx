import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import videodesk from '../../../src/assets/Videos/VIDEOHOME.mp4';
import videomob from '../../../src/assets/Videos/TUTTO_VERTICALE.mp4';
import './Header.css';

function Header() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 602);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="w-100 header" style={{ minHeight: "100vh", backgroundImage: "linear-gradient(to bottom, black 90%, black 90%, white 0%)", position: 'relative' }}>
            <ReactPlayer
                url={isMobile ? videomob : videodesk}
                playing={true}
                loop={true}
                muted={true}
                playsInline={true}
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }}
                config={{
                    file: {
                        attributes: {
                            style: { width: "100%", height: "100%" },
                            disablePictureInPicture: true,
                        }
                    }
                }}
                onContextMenu={(e) => e.preventDefault()}
                controls={false}
            />
        </div>
    );
}

export default Header;
