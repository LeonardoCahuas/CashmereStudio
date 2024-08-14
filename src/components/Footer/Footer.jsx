import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/cashlogocolor.png'; // Update this path to your actual logo file
import './Footer.css'; // You can style this component in a separate CSS file

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
                <h3 className="text-center fs-2 text-white" style={{ fontWeight: 900 }}>CASHMERE STUDIO</h3>
                <p className="text-white" style={{ marginTop: "-10px" }}>All rights reserved</p>
            </div>

            <div className="d-flex flex-row align-items-center justify-content-around" style={{ gap: "70px" }}>
                {!isMobile && (
                    <h3 className="text-center fs-5 text-white" style={{ margin: "0px" }}>FOLLOW US</h3>
                )}
                <div className='d-flex flex-row align-items-center justify-content-center' style={{ gap: "10px" }}>
                    <i className="fa-brands fa-instagram" style={{ width: "35px", fontSize: "30px", color: "white" }}></i>
                    <p className="text-white" style={{ margin: "0px" }}>@cashmerestudiomilano</p>
                   
                </div>
            </div>

            {isMobile ? (
                <div className="footer-credits-mobile mt-4">
                    <div className="d-flex flex-column justify-content-between w-100 px-3" style={{ gap: "20px" }}>
                    <Link to="/privacy" style={{color:"grey", textDecoration:"none"}}>Informativa Privacy</Link>
                        <a href="tel:+393514206294" className="footer-link">+39 351 420 6294</a>
                        <a href="mailto:cashmerestudiomilano@gmail.com" className="footer-link">cashmerestudiomilano@gmail.com</a>
                    </div>
                    <div className="d-flex justify-content-center mt-2">
                        <a href="https://www.google.com/maps?q=via+oreste+salomone+61+milano" target="_blank" rel="noopener noreferrer" className="footer-link text-center">Via Oreste Salomone 61, Milano</a>
                    </div>
                </div>
            ) : (
                <div className="footer-credits">
                    <Link to="/privacy" style={{color:"grey", textDecoration:"none"}}>Informativa Privacy</Link>
                    <a href="tel:+393514206294" className="footer-link">+39 351 420 6294</a>
                    <a href="mailto:cashmerestudiomilano@gmail.com" className="footer-link">cashmerestudiomilano@gmail.com</a>
                    <a href="https://www.google.com/maps?q=via+Oreste+Salomone+61+Milano" target="_blank" rel="noopener noreferrer" className="footer-link">Via Oreste Salomone 61</a>
                </div>
            )}
            
        </div>
    );
}

export default Footer;
