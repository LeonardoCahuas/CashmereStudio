import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import logo from "../../assets/cashlogo.png";
import logo1 from "../../assets/cashlogocolor.png";
import './Navbar.css';
import stu1 from "../../assets/mem.png";
import stu2 from "../../assets/rec.png";
import stu3 from "../../assets/prod.png";
import service1 from "../../assets/service1.png";
import service2 from "../../assets/service2.png";
import service3 from "../../assets/service3.png";
import 'jquery';
import 'popper.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import cashblue from '../../assets/cashblue.png'
import rec from '../../assets/service1.png'
import prod from '../../assets/service3.png'
import mem from '../../assets/service2.png'
import pos from '../../assets/pos.png'
import cell from '../../assets/cell.png'
import insta from '../../assets/instag.png'
import mail from '../../assets/mail.png'



const studios = [
    "",
    stu1,
    stu2,
    stu3
];

const services = [
    "",
    service1,
    service2,
    service3
];

const descriptions = [
    "",
    { to: "/rec", img: rec, title: "Registrazioni", desc: "La fase di registrazione è quella in cui l'artista viene al microfono e registra le sue parti vocali." },
    { to: "/mixmaster", img: mem, title: "Mix & Master", desc: "Processo finale di lavorazione sul beat e sulla voce, è l’attività che fa suonare professionale una canzone." },
    { to: "/prod", img: prod, title: "Produzione", desc: "La fase di registrazione è quella in cui l'artista viene al microfono e registra le sue parti vocali." }
];

export function Navbar({ isHome }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [openStudi, setOpenStudi] = useState(false);
    const [openServizi, setOpenServizi] = useState(false);
    const [openContatti, setOpenContatti] = useState(false);

    const toggleDropdown = (dropdown) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    };

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

    const openItem = (item) => {
        switch (item) {
            case "studi":
                setOpenStudi(prev => !prev);
                setOpenServizi(false);
                setOpenContatti(false);
                break;
            case "servizi":
                setOpenServizi(!openServizi);
                setOpenStudi(false);
                setOpenContatti(false);
                break;
            case "contatti":
                setOpenContatti(!openContatti);
                setOpenStudi(false);
                setOpenServizi(false);
                break;
            default:
                break;
        }
    };

    const closeDropdowns = () => {
        setOpenDropdown(null);
        setOpenStudi(false);
        setOpenServizi(false);
        setOpenContatti(false);
    };

    useEffect(() => {
        const handleScroll = () => {
            setOpenDropdown(null);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

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
                        <Link to="/" className="nav-link nav-home mx-3">Home</Link>
                        <NavDropdown title="Studi" id="studio-dropdown" className="mx-3">
                            {[1, 2, 3].map((i) => (
                                <NavDropdown.Item as={Link} to={`/studio${i}`} key={i}>
                                    <img src={cashblue} alt="Logo Cashmere Studio"   style={{ width: "23px", marginRight: "10px" }} />    Studio {i}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>
                        <NavDropdown title="Servizi" id="services-dropdown" className="mx-3">
                            {[1, 2, 3].map((i) => (
                                <NavDropdown.Item as={Link} to={descriptions[i].to} key={i}>
                                    <img src={descriptions[i].img} style={{ width: descriptions[i].to == "/rec" ? "17px" : descriptions[i].to == "/prod" ? "15px" : "20px", marginRight: descriptions[i].to == "/mixmaster" ? "12px" : "15px" }} alt="Servizio Cashmere Studio"  />{descriptions[i].title}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>
                        <NavDropdown title="Contatti" id="contact-dropdown" className="mx-3" style={{ display: "flex", flexDirection: "row", gap: "100px" }}>
                            <NavDropdown.Item href="https://maps.google.com/?q=Via+Oreste+Salomone+61+Milano">
                                <img src={pos} style={{ width: "17px", marginRight: "10px" }} alt="Icona Posizione"  /> Posizione
                            </NavDropdown.Item>
                            <NavDropdown.Item href="tel:+393514206294" >
                                <img src={cell} style={{ width: "17px", marginRight: "10px" }} alt="Icona telefono" /> Telefono
                            </NavDropdown.Item>
                            <NavDropdown.Item href="mailto:cashmerestudiomilano@gmail.com">
                                <img src={mail} style={{ width: "17px", marginRight: "10px" }} alt="Icona email"/> Email
                            </NavDropdown.Item>
                            <NavDropdown.Item href="https://instagram.com/cashmerestudiomilano">
                                <img src={insta} style={{ width: "16px", marginRight: "10px" }} alt="Icona Instagram"/> Instagram
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    {isHome &&
                        <div style={{ width: "22vw", justifyContent: "center" }} className='d-flex flex-row align-items-center' >
                            <Link to="/book" style={{ textDecoration: "none" }}>
                                <button type="button" className="book-button w-100 ml-auto" style={{ fontWeight: 600, fontSize: "14px", paddingLeft: "25px", paddingRight: "25px" }}>Prenota una sessione</button>
                            </Link>
                        </div>
                    }
                </BootstrapNavbar.Collapse>
            </Container>
            <Link style={{display:"none"}} to="/admin">admin</Link>
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
                <Link to="/" className={`navlogo w-100 d-flex flex-column ${isHome ? 'align-items-center' : 'align-items-end'}`} style={{paddingRight: isHome ? "0px" : "20px"}}>
                    <img src={logo} style={{ width: "25%" }} alt="Logo Cashmere Studio" />
                </Link>
            </div>
            {isHome &&
                <div className='w-25'>
                    <Link to="/book">
                        <button type="button" className="book-button p-2" style={{ fontWeight: 900 }}>Prenota</button>
                    </Link>
                </div>
            }
            <div className="collapse navbar-collapse navbar-collapse-fullscreen" id="navbarNavDropdown">
                <div className='w-100 d-flex flex-column align-items-end p-3'>
                    <button type="button" className="close" data-toggle="collapse" data-target="#navbarNavDropdown" aria-label="Close" style={{ backgroundColor: "black", background: "black", fontSize: "50px", paddingBottom: "0px" }}>
                        <span style={{ height: "30px" }}>&times;</span>
                    </button>
                </div>


                <ul className="navbar-nav">
                    <li className="w-100 nav-item d-flex flex-column align-items-start" style={{ paddingLeft: "30px" }} >
                        <Link className="nav-link" to="/"  data-toggle="collapse" data-target="#navbarNavDropdown" aria-label="Close" style={{ fontSize: "25px", fontWeight: 900 }}>Home</Link>
                    </li>
                    <li className="nav-item w-100">
                        <div className="nav-link w-100" onClick={() => openItem('studi')}>
                            <div className='w-100 d-flex flex-row align-items-center justify-content-between' style={{ paddingLeft: "30px", paddingRight: "30px" }}> <p style={{ fontSize: "25px", fontWeight: 900 }}>Studi</p> <p>{openStudi ? '↓' : '↑'}</p></div>
                            {
                                openStudi ?
                                    <div className="w-100">
                                        <div className="w-50 d-flex flex-column align-items-left mt-4 mb-3" style={{ gap: "30px", paddingLeft: "20px" }}>
                                            {studios.slice(1, 4).map((studio, index) => (
                                                <Link to={`/studio${index + 1}`} className="w-100 d-flex flex-row align-items-center justify-content-center" style={{ gap: "30px", textDecoration: "none", }} key={index} data-toggle="collapse" data-target="#navbarNavDropdown" aria-label="Close">
                                                    <img src={studio} alt={`Studio ${index + 1}`} style={{ width: "25%" }}/>
                                                    <span style={{ color: "white", fontWeight: 100, fontSize: "18px" }}>Studio {index + 1}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                    :
                                    ""
                            }
                        </div>
                    </li>
                    <li className="nav-item w-100">
                        <div className="nav-link w-100" onClick={() => openItem('servizi')}>
                            <div className='w-100 d-flex flex-row align-items-center justify-content-between' style={{ paddingLeft: "30px", paddingRight: "30px" }}> <p style={{ fontSize: "25px", fontWeight: 900 }}>Servizi</p> <p>{openServizi ? '↓' : '↑'}</p></div>
                            {
                                openServizi ?
                                    <div className="">
                                        <div className="dropdown-content servizi w-100 d-flex flex-column" style={{ width: "100%" }}>
                                            {[1, 2, 3].map((i) => (
                                                <Link to={descriptions[i].to} data-toggle="collapse" data-target="#navbarNavDropdown" aria-label="Close" style={{ textDecoration: "none" }}>
                                                    <div className="card-services d-flex flex-row align-items-center" key={i} style={{ padding: i === 2 ? "10px" : "10px", width: "100%", gap: "30px" }}>
                                                        <div className='w-25'>
                                                            <img src={services[i]} style={{ height: "35px" }} alt={`Servizio ${i}`} />
                                                        </div>
                                                        <h3 style={{ fontSize: "18px", color: "white", textDe: "black", marginTop: "12px" }}>{descriptions[i].title}</h3>

                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div> :
                                    ""
                            }
                        </div>


                    </li>
                    <li className="nav-item w-100">
                        <div className="nav-link w-100" onClick={() => openItem('contatti')}>
                            <div className='w-100 d-flex flex-row align-items-center justify-content-between' style={{ paddingLeft: "30px", paddingRight: "30px" }}> <p style={{ fontSize: "25px", fontWeight: 900 }}>Contatti</p> <p>{openContatti ? '↓' : '↑'}</p></div>
                            {openContatti && (
                                <div className="" aria-labelledby="navbarDropdownMenuLink">
                                    <div className="d-flex flex-column p-2 pt-1">
                                        <div className="contact-item d-flex align-items-center p-2" style={{gap:"10px"}}>
                                            <i className="fas fa-map-marker-alt" style={{ color: "grey", fontSize: "14px" }}></i>
                                            <div>
                                                <label className="text-gray mb-0" style={{ color: "grey", fontSize: "14px" }}>Indirizzo:</label>
                                                <span className="ms-2"  style={{fontSize: "14px" }} >Via Oreste Salomone 61, Milano</span>
                                            </div>
                                        </div>
                                        <div className="contact-item d-flex align-items-center p-2" style={{gap:"10px"}}>
                                            <i className="fas fa-phone-alt text-gray" style={{ color: "grey", fontSize: "16px" }}></i>
                                            <div>
                                                <label className="text-gray mb-0" style={{ color: "grey", fontSize: "14px" }}>Telefono:</label>
                                                <span className="ms-2"  style={{fontSize: "14px" }} >+39 351 420 6294</span>
                                            </div>
                                        </div>
                                        <div className="contact-item d-flex align-items-center p-2" style={{gap:"10px"}}>
                                            <i className="fas fa-envelope text-gray" style={{ color: "grey", fontSize: "16px" }}></i>
                                            <div>
                                                <label className="text-gray mb-0" style={{ color: "grey", fontSize: "14px" }}>Email:</label>
                                                <span className="ms-2"  style={{fontSize: "14px" }} >cashmerestudiomilano@gmail.com</span>
                                            </div>
                                        </div>
                                        <div className="contact-item d-flex align-items-center p-2" style={{gap:"10px"}}>
                                            <i className="fab fa-instagram text-gray" style={{ color: "grey", fontSize: "16px" }}></i>
                                            <div>
                                                <label className="text-gray mb-0" style={{ color: "grey", fontSize: "14px" }}>Instagram:</label>
                                                <span className="ms-2"  style={{fontSize: "14px" }} >@cashmerestudiomilano</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </li>
                </ul>
            </div>
            <Link style={{display:"none"}}  to="/admin"></Link>
        </div>
    );

    return isMobile ? renderMobileNavbar() : renderDesktopNavbar();
}

export default Navbar;
 