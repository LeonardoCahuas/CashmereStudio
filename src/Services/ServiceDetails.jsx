import React, { useState, useEffect } from 'react';
import info from "./info";
import Navbar from "../components/Navbar/Navbar";
import { Link } from "react-router-dom";
import "./Services.css"
import Services from "../Homepage/Services";
import stu1 from "../assets/stu1.png";
import stu2 from "../assets/stu2.png";
import stu3 from "../assets/stu3.png";
import ser1 from "../assets/service11.png";
import ser2 from "../assets/service12.png";
import ser3 from "../assets/service13.png";

const studios = [
    "",
    stu1,
    stu2,
    stu3
];

const servicesimage = {
    "rec":ser1,
    "mem":ser2,
    "prod":ser3
}

function ServiceDetails({ service }) {
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
        <div style={{paddingTop:"80px"}}>
            <div className={`d-flex ${isMobile ? 'flex-column' : 'flex-row align-items-start'} bg-black`} style={{overflow:"hidden"}}>
                <div style={{  width:"50%", overflow:"hidden", height:"100%" }}>
                    <img src={info[service].image} alt="Descrizione immagine" style={{ width: '100%'}} />
                </div>
                <div style={{ backgroundColor: 'black', color: 'white', height:"100%", width:"50%" }}>
                    <div className={`text-start w-75`} style={{ margin: isMobile ? '0 auto' : '', padding: isMobile ? "20px" : "50px", paddingTop:"50px" , paddingBottom:"50px"  }}>
                        <div className='d-flex flex-row align-items-center' style={{gap:"15px"}}><h1 style={{ fontWeight: 'bold', fontSize: "4em" }}>{info[service].title}</h1><img src={servicesimage[service]}  style={{height:"3em", marginBottom:"12px"}}/></div> 
                        <p style={{ fontWeight: 600, marginTop: "50px" }}>Descrizione:</p>
                        <p style={{ color: "grey" }}>{info[service].parag1}</p>
                        <p style={{ fontWeight: 600, marginTop: "100px" }}>{info[service].title2}</p>
                        <ul>
                            {info[service].infos.map((item, index) => (
                                <li style={{ color: "grey" }} key={index}>{item}</li>
                            ))}
                        </ul>
                        <Link to="/book" className='w-100 d-flex flex-column align-items-center justify-content-center' style={{textDecoration:"none"}}>
                            <button className="bookservice" style={{fontWeight:600}}>Prenota una sessione</button>
                        </Link>
                    </div>
                </div>
            </div>
            <Services service={service} />
            <div style={{ paddingBottom: "100px" }}>
                <h3 style={{ fontSize: "35px", fontWeight: 700, marginTop: "50px", marginBottom: "50px" }}>Gli Studi</h3>
                <div className="dropdown-content studi align-items-center" style={{flexDirection:isMobile ? "column" : "row"}}>
                    {[1, 2, 3].map((i) => (
                        <Link to={`/studio${i}`} key={i} style={{ width: isMobile? "75%" : "25%", textDecoration: "none" }}>
                            <div className="card-services-page" style={{ width: "100%", borderRadius:"10px" }}>
                                <img src={studios[i]} alt={`Studio ${i}`} className="w-100" style={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }} />
                                <h5 style={{ fontWeight: 500, marginTop: "20px", color:"black" }}>Studio {i}</h5>
                                <Link to={`/studio${i}`}>
                                    <button className="infobutton" style={{fontWeight:600, fontSize:"17px", paddingLeft:"35px", paddingRight:"35px", marginBottom:"15px"}}>Scopri di più</button>
                                </Link>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ServiceDetails;
