import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ScrollToTop from '../../ScrollToTop';

const Step4 = ({ selectedDay, selectedStart, selectedEnd, onAddPrenotazione, studio, goBack, services, needFonico }) => {
    const [nomeUtente, setNomeUtente] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
    const navigation = useNavigate()

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const inizio = new Date(`${selectedDay}T${selectedStart}:00`);
        const fine = new Date(`${selectedDay}T${selectedEnd}:00`);

        try {
            await onAddPrenotazione({
                nomeUtente,
                inizio,
                fine,
                telefono,
                studio,
                stato: 1,
                services: services,
                sessionWithFonico: needFonico
            });
            alert("Prenotazione richiesta con successo. Cashmere Studio ti confermerà l'appuntamento il prima possibile");
            setNomeUtente('');
            setTelefono('');
            setEmail('');;  // Redirect to /home after successful submission
            navigation("/")

        } catch (error) {
            console.log(error);
            console.error("Errore nell'aggiunta della prenotazione: ", error.message);
            alert("Errore durante l'aggiunta della prenotazione.");
        }
    };


    return (
        <ScrollToTop>
            <div className='d-flex flex-column align-items-center' style={{ paddingBottom: "70px" }}>
                <div className="mt-5 text-start" style={{ border: "1px solid black", padding: isMobile ? "30px" : "50px", borderRadius: "15px", width: isMobile ? "80%" : "33%" }}>
                    <p style={{ textDecoration: "underline", cursor: "pointer", width: "fit-content", color: "#08B1DF" }} onClick={() => goBack()}>{"< Indietro"}</p>
                    <h3 className="mb-3 fs-2" style={{ fontWeight: 900 }}>Inserisci i tuoi dati</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label htmlFor="nomeUtente" className="form-label d-flex flex-row align-items-center" style={{ fontSize: "17px" }}> <i class="fa-brands fa-instagram" style={{ fontSize: "25px", color: "black", marginRight: "10px" }}></i> Nome utente Instagram</label>
                            <input type="text" className="form-control" id="nomeUtente" value={nomeUtente} onChange={(e) => setNomeUtente(e.target.value)} required placeholder='@nomeutente' style={{ backgroundColor: "rgb(240, 240, 240)", padding: "15px" }} />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="nomeUtente" className="form-label  d-flex flex-row align-items-center" style={{ fontSize: "17px" }}> <i class="fa-brands fa-whatsapp" style={{ fontSize: "25px", color: "black", marginRight: "10px" }}></i> Numero di telefono</label>
                            <input type="text" className="form-control" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required placeholder='Numero Whatsapp' style={{ backgroundColor: "rgb(240, 240, 240)", padding: "15px" }} />
                        </div>


                        <button type="submit" className="btn btn-primary w-100" style={{ border: "1px solid #08B1DF", padding: "15px", fontSize: "20px", marginTop: "50px", fontWeight: 700 }}>Invia richiesta di prenotazione</button>

                    </form>
                </div>
            </div>
        </ScrollToTop>
    );
};

export default Step4;
