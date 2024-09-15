import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import videodesk from '../../../src/assets/Videos/VIDEOHOME.mp4';
import fallbackImage1 from '../../../src/assets/headmob.jpg';  // Prima immagine di fallback
import fallbackImage2 from '../../../src/assets/headmob2.jpg'; // Seconda immagine di fallback
import './Header.css';
import { Link } from 'react-router-dom';

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
        <div className="w-100 header" style={{ minHeight: "80vh", backgroundImage: "linear-gradient(to bottom, black 80%, black 80%, white 0%)", position: "relative" }}>
            <div className='h-100'>
                {isMobile ? (
                    <>
                        {/* Layout per Mobile */}
                        <div className="mobile-layout mt-5">
                            {/* Prima immagine */}
                            <div className="image-section top-image">
                                <img
                                    src={fallbackImage1}
                                    alt="Mobile Top Image"
                                    className="image"
                                />
                            </div>

                            {/* Seconda immagine */}
                            <div className="image-section bottom-image">
                                <img
                                    src={fallbackImage2}
                                    alt="Mobile Bottom Image"
                                    className="image"
                                />
                            </div>

                            {/* Testo centrato */}
                            <div className="centered-text d-flex flex-column align-items-start p-0 w-75">
                                <h1 style={{fontSize:"29px", fontWeight:"900"}}>CASHMERE STUDIO</h1>
                                <p style={{color:"white", fontSize:"15px", fontWeight:"400", textAlign:"start"}}>Prenota una sessione in uno dei nostri 3 studi con attrezzatura di altissimo livello, e sfrutta i nostri servizi di Recording, Mix&Master e Produzione.</p>
                                <Link to="/book"> <button style={{background:"transparent", backgroundColor:"white", color:"black", fontWeight:"900"}}>PRENOTA ORA</button></Link>
                            </div>
                        </div>
                    </>
                ) : (
                    // Mostra il video su desktop
                    <ReactPlayer
                        url={videodesk}
                        playing={true}
                        loop={true}
                        muted={true}
                        playsinline={true}
                        width="100%"
                        height="100%"
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
                )}
            </div>
        </div>
    );
}

export default Header;
