import React, { useState, useEffect } from 'react';
import info from './info';
import { storage, ref, getDownloadURL } from '../firebase-config';
import './Studio.css'; // Make sure to create this CSS file and add the necessary styles
import { Link } from 'react-router-dom';
import studio1 from "../../src/assets/Videos/Studio1.mp4"
import studio2 from "../../src/assets/Videos/Studio2.mp4"
import studio3 from "../../src/assets/Videos/Studio3.mp4"
import studio1m from "../../src/assets/Videos/Studio1_VERTICALE.mp4"
import studio2m from "../../src/assets/Videos/Studio2_VERTICALE.mp4"
import studio3m from "../../src/assets/Videos/Studio3_VERTICALE.mp4"

function StudioDetails({ index }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        const fetchVideoUrl = async () => {
            const videoRef = ref(storage, isMobile ? `Studio${index}_VERTICALE.mp4` : `Studio ${index}.mp4`);
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
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Call initially to set the correct state

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div style={{ paddingTop: "100px" }}>
            <div style={{ width: '100vw', backgroundColor: 'white', paddingTop: isMobile ? "30px" : '15px', paddingBottom: '15px', paddingLeft: isMobile ? '20px' : '70px', paddingRight: isMobile ? '20px' : '70px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center' }}>
                <div className='text-start'>
                    <h5 style={{ color: 'black', fontWeight: 900, fontSize: "17px" }}>Studio {index}</h5>
                    <div className='d-flex flex-row' style={{ gap: "10px" }}>
                        <p style={{ color: 'grey', margin: 0 }}>Dimensioni</p>
                        <p style={{ color: 'black', margin: 0, fontWeight: 900, fontSize: "17px" }}>50 X 40M</p>
                    </div>
                </div>
                <Link to="/book">
                    <button style={{ fontWeight: 600 }}>
                        Prenota una sessione
                    </button>
                </Link>
            </div>
            <div style={{ position: 'relative', textAlign: 'center', color: 'white' }}>
                <div className='studio-img' style={{ width: '100%', height: isMobile ? 'auto' : 'auto' }}>

                    <video className="video-bg" autoPlay loop playsInline muted style={{ width: "100vw", backgroundColor: "black" }}>
                        <source src={index == 1 && !isMobile ? studio1 : index == 2 && !isMobile ? studio2 : index == 3 && !isMobile ? studio3 : index == 1 && isMobile ? studio1m : index == 2 && isMobile ? studio2m : index == 3 && isMobile ? studio3m : studio2m} type="video/mp4" />
                        Il tuo browser non supporta il tag video.
                    </video>

                    <div
                        className="w-100"
                        style={{ height: '1000px', display: videoUrl ? 'none' : 'block', backgroundColor: "black" }}
                        alt="Header"
                    >
                    </div>
                </div>
                <h1 style={{
                    position: 'absolute',
                    top: isMobile ? '20%' : '10%',
                    left: '10%',
                    transform: isMobile ? '' : 'translate(-50%, -50%)',
                    fontSize: isMobile ? '2rem' : '4rem',
                    fontWeight: 900
                }}>
                    Studio {index}
                </h1>
            </div>
            <div className='d-flex flex-column w-100 align-items-start' style={{ padding: isMobile ? '20px' : '50px', alignItems: isMobile ? "center" : "start" }}>
                <h4 style={{ fontSize: "20px", width: "100%", fontWeight: 700, textAlign: isMobile ? "center" : "left" }}>Strumentazione</h4>
                <ul className='d-flex p-0 flex-row align-item-center justify-content-start flex-wrap'>

                    {
                        info[index].items.map((item, i) => (
                            <li key={i} className='item-cont'>
                                {item}
                            </li>
                        ))
                    }
                </ul>
                <div className='w-100'>
                    <h4 style={{ fontSize: "20px", fontWeight: 700, width: "100%", textAlign: isMobile ? "center" : "left", marginTop: "50px" }}>Descrizione</h4>
                    <p style={{ color: 'grey', textAlign: isMobile ? "center" : "left", borderBottom: isMobile ? "1px solid black" : "none", paddingBottom: isMobile ? "50px" : "auto", width: "100%" }}>
                        {info[index].description}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default StudioDetails;
