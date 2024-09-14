import React, { useState, useEffect } from 'react';
import logo from '../assets/cashblue.png';
import './Paragraph.css'; // Importa il file CSS

const Paragraph = () => {
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
        <div className={`w-100 d-flex flex-column align-items-center justify-content-center bg-white`} style={{paddingTop:"100px",padding:isMobile ? "10px" : "50px", marginTop:"40px"}}>
        <div 
            className="d-flex align-items-center" 
            style={{ 
                backgroundColor: '#f9f9f9', 
                flexDirection:'column', 
                padding: isMobile ? "20px" : '50px',
                
                alignItems:"start",
                justifyContent:"space-between",
                width:isMobile ? "96%" : "90%",
                borderRadius:"20px",
                gap:"20px"
            }}
        >
            <div className="w-100 d-flex align-items-center justify-content-start" style={{  paddingLeft: isMobile ? "0px" : "50px", paddingRight: isMobile ? "0px" : "50px", flexDirection: isMobile ?"column" : "row", gap:"20px" }}>
                <img src={logo} alt="Cashmere Studio Logo" style={{ width:  '40px', marginRight: isMobile ? "5px" : '20px' }} />
                <h1 className="title m-0" style={{fontSize: isMobile ? "35px" : "45px", whiteSpace:"nowrap", width:"100%", textAlign:"start"}}> {/* Applica la classe CSS */}
                    CASHMERE STUDIO MILANO
                </h1>
            </div>
            <div style={{ textAlign: 'left', color: 'black', paddingLeft: isMobile ? "0px" : "50px", paddingRight: isMobile ? "0px" : "50px" }}>
                <p>
                    Cashmere Studio è il tuo punto di riferimento per la registrazione e la produzione musicale a Milano. <br/><br/>
                    Offriamo un ambiente professionale e attrezzature di alta qualità per garantire risultati eccezionali. 
                    Che tu sia un artista emergente o un professionista affermato, il nostro studio è progettato per soddisfare 
                    tutte le tue esigenze creative. Unisciti a noi per trasformare le tue idee in realtà sonore.
                </p>
            </div>
        </div>
        </div>
    );
};

export default Paragraph;