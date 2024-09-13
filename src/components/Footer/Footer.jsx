import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/cashlogocolor.png';
import './Footer.css';

const Footer = () => {
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
        <div className="footer-container bg-black">

            <div className="footer-logo">
                <img src={logo} alt="Logo Cashmere Studio" style={{ width: "60px" }} />
            </div>
            <div className="d-flex flex-column align-items-center justify-content-center">
                <h3 className="text-center fs-2 text-white" style={{ fontWeight: 900 }}>CASHMERE STUDIO S.R.L</h3>
                <p className="text-white" style={{ marginTop: "-10px" }}>All rights reserved</p>
            </div>

            <div className="d-flex flex-column align-items-center justify-content-around" style={{ gap:isMobile ? "20px" : "33px", marginTop:"30px" }}>
                <div className='d-flex flex-row align-items-center justify-content-around' style={{ gap: "20px" }}>
                    <a href="https://www.instagram.com/cashmerestudiomilano?igsh=MWY0eXZxeTZ0OW9uaQ==" className='d-flex flex-row align-items-center justify-content-center' style={{ gap: "1px", textDecoration: "none" }}>
                        {!isMobile && <i className="fa-brands fa-instagram" style={{ width: "25px", fontSize: "20px", color: "white" }}></i>}
                        <p className="text-white" style={{ margin: "0px", fontSize: "15px" }}>{isMobile ? "Instagram" : "@cashmerestudiomilano"}</p>

                    </a>
                    <Link to="/privacy" style={{ color: "white", textDecoration: "none", marginBottom: "10px", margin: "0px", fontSize:"15px" }}>{isMobile ? "Privacy" : "Informativa privacy"}</Link>
                </div>
                <div  className='d-flex flex-row align-items-center justify-content-around' style={{gap:"40px"}}>
                    <div className="d-flex flex-column justify-content-center align-items-center m-0">
                        <a href="https://www.google.com/maps?q=via+oreste+salomone+61+milano" target="_blank" rel="noopener noreferrer" className="footer-link m-0" style={{ color: "white", marginBottom: "10px" }}>{isMobile ? "Dove siamo" : "Via Oreste Salomone 61, Milano"}</a>
                    </div>
                    <a href="https://wa.me/+393514206294" className="footer-link d-block" style={{ color: "white" }}>{isMobile ? "Telefono" : "+39 351 420 6294"}</a>
                    <a href="mailto:cashmerestudiomilano@gmail.com" className="footer-link m-0" style={{ color: "white", marginBottom: "10px" }}>{isMobile ? "Mail" : "cashmerestudiomilano@gmail.com"}</a>
                </div>
            </div>

            {isMobile ? (
                <div className="footer-credits-mobile mt-4" style={{ fontSize: "12px", color: "#666" }}>
                    <div className="container">

                        <div className="row text-center mt-3">
                            <div className="col-12">
                                <p style={{ marginBottom: "5px" }}>Sede legale: Corso Monforte 2, Milano 20122</p>
                                <p style={{ marginBottom: "0" }}>P.IVA: 13135210964</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="footer-credits" style={{ fontSize: "12px", color: "#666" }}>
                    <div className="container">
                        <div className="row">
                            <div className="d-flex flex-row justify-content-center align-items-end" style={{ gap: "20px" }}>
                                <p className='m-0'>Sede legale: Corso Monforte 2, Milano 20122</p>
                                <p className='m-0'>P.IVA: 13135210964</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}



        </div>
    );
}

export default Footer;
