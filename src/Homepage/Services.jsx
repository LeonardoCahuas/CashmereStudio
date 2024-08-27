import React, { useState, useEffect } from 'react';
import service1 from "../assets/service1.png";
import service2 from "../assets/service2.png";
import service3 from "../assets/service3.png";
import { Link } from "react-router-dom";

const services = [
    "",
    service1,
    service2,
    service3
];

const descriptions = [
    "",
    { to: "/rec", title: "REC", desc: "La fase di registrazione è quella in cui l'artista viene al microfono e registra le sue parti vocali." },
    { to: "/mixmaster", title: "MIX & MASTER", desc: "Processo finale di lavorazione sul beat e sulla voce degli effetti, in breve  è l’attività che serve per far suonare bene e professionale una canzone." },
    { to: "/prod", title: "PRODUZIONE", desc: "La fase di registrazione è quella in cui l'artista viene al microfono e registra le sue parti vocali." }
];

const indexes = {
    "rec": 1,
    "mem": 2,
    "prod": 3
};

function Services({ service }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);

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
        <div className="bg-white" style={{ paddingTop:isMobile? "30px"  : "100px", paddingBottom: "100px" }}>
            <h3 style={{ fontSize: "35px", fontWeight: 900, marginBottom: "50px" }}>
                {Object.keys(indexes).includes(service) ? "Gli altri servizi" : "I nostri servizi"}
            </h3>
            <div className={`d-flex flex-${isMobile ? 'column p-4' : 'row'} justify-content-center`} style={{gap: isMobile ? "-30px" : "auto"}}>
                {[1, 2, 3].map((i) => (
                    <div className="card-services flex-column align-items-center" key={i} style={{ width: isMobile ? '100%' : '30%', borderRight: i === 2 && !service && !isMobile ? "none" : "none", borderLeft: i === 2 && !service && !isMobile ? "none" : "none", padding: "30px", display: indexes[service] === i ? "none" : "flex" }}>
                        <img src={services[i]} style={{ height: "100px" }} alt={`Service ${i} image`} />
                        <h3 style={{ fontWeight: 900, marginTop: "30px", marginBottom: "30px" }}>{descriptions[i].title}</h3>
                        <p className="text-center" style={{fontSize:"16px", color:"#B1B1B1", paddingBottom:"30px"}}>{descriptions[i].desc}</p>
                        <Link to={descriptions[i].to}>
                            <button className="book-button" style={{fontWeight:600}}>Scopri di più</button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Services;
