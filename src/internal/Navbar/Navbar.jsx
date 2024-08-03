import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import logo from "../../assets/cashlogo.png";
import './Navbar.css';
import 'jquery';
import 'popper.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';

export function NavbarAdmin({ setCont }) {
    const [isMobile, setIsMobile] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // Stato per tenere traccia dell'elemento selezionato

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

    const handleItemClick = (index) => {
        setSelectedItem(index); // Aggiorna lo stato con l'indice dell'elemento cliccato
        console.log("indice:" + index)
        setCont(index)
    };

    const renderDesktopNavbar = () => (
        <BootstrapNavbar expand="lg" bg="black" variant="dark" fixed="top" style={{ padding: "0px" }}>
            <Container style={{ margin: "0px", width: "100vw", paddingLeft: "85px", paddingRight: "10px", paddingTop: "15px", paddingBottom: "15px" }}>
                <Link to="/" style={{ width: "13vw", margin: "0px" }}>
                    <BootstrapNavbar.Brand>
                        <img src={logo} alt="Logo Cashmere Studio" className="d-inline-block align-top" style={{ width: "50px" }} />
                    </BootstrapNavbar.Brand>
                </Link>
                <BootstrapNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="m-auto d-flex flex-row align-items-center justify-content-end" style={{ width: "65vw", gap: "60px" }} >
                        <Link className="nav-link mx-3" onClick={() => handleItemClick(0)}>Situazione</Link>
                        <Link className="nav-link mx-3" onClick={() => handleItemClick(1)}>Calendario</Link>
                        <Link className="nav-link mx-3" onClick={() => handleItemClick(2)}>Conferma</Link>
                        <Link className="nav-link mx-3" onClick={() => handleItemClick(3)}>Prenotazioni</Link>
                        <Link className="nav-link mx-3" onClick={() => handleItemClick(4)}>Fonici</Link>
                    </Nav>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );

    const renderMobileNavbar = () => (
        <div className="d-flex flex-row align-items-center justify-content-between text-white navbar-container bg-black p-3 position-fixed m-0" style={{ paddingTop: "0px", zIndex: "999", top: "0px" }}>
            <div className='w-25 pr-5  d-flex flex-column align-items-start' style={{ paddingLeft: "25px" }}>
                <button style={{ background: "transparent", color: "white" }} className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon">
                        <i className="fa-solid fa-grip-lines text-white fs-1"></i>
                    </span>
                </button>
            </div>
            <div className='w-50'>
                <Link className={`navlogo w-100 d-flex flex-column ${ 'align-items-end'}`} style={{paddingRight:  "20px"}}>
                    <img src={logo} style={{ width: "25%" }} alt="Logo Cashmere Studio" />
                </Link>
            </div>
            <div className="collapse navbar-collapse navbar-collapse-fullscreen" id="navbarNavDropdown">
                <div className='w-100 d-flex flex-column align-items-end p-3'>
                    <button type="button" className="close" data-toggle="collapse" data-target="#navbarNavDropdown" aria-label="Close" style={{ backgroundColor: "black", background: "black", fontSize: "50px", paddingBottom: "0px" }}>
                        <span style={{ height: "30px" }}>&times;</span>
                    </button>
                </div>

                <ul className="navbar-nav">
                    {["Situazione", "Calendario", "Conferma", "Prenotazioni", "Fonici"].map((label, index) => (
                        <li className="w-100 nav-item d-flex flex-column align-items-start" style={{ paddingLeft: "30px" }} key={index}>
                            <Link className="nav-link" style={{ fontSize: "25px", fontWeight: 900 }} onClick={() => handleItemClick(index)}>{label}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );

    return isMobile ? renderMobileNavbar() : renderDesktopNavbar();
}

export default NavbarAdmin;
