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
        <div className="w-100 header bg-white p-0" style={{minHeight:"90vh"}}>
            <div className='h-100'>
                <ReactPlayer
                    url={isMobile ? videomob : videodesk}
                    playing={true}
                    loop={true}
                    muted={true}
                    playsinline={true}
                    width="100%"
                    height="100%"
                    preload="auto"
                    config={{
                        file: {
                            attributes: {
                                style: { width: "100vw", height: "100%" },
                                disablePictureInPicture: true,
                            }
                        }
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    controls={false}
                />
            </div>
        </div>
    );
}

export default Header;