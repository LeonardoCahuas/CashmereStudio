import usePrenotazioni from '../../../booking/useBooking';
import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { InputLabel, MenuItem, Select } from '@mui/material';
export const Calendar = ({ isAdmin, fonico }) => {
    const { fonici, prenotazioni, setDisponibilita, setNonDisponibilita, setDisponibilita2, setFerie } = usePrenotazioni();
    const [selectedFonico, setSelectedFonico] = useState(fonico ? fonico : "2lpxhZK8JKmvC3nZxR6N");
    const [editingDisponibilita, setEditingDisponibilita] = useState(false)
    const [selectedDisponibilita, setSelectedDisponibilita] = useState(fonici.find(f => f.id == fonico ? fonico : "2lpxhZK8JKmvC3nZxR6N")?.disponibilita ? fonici.find(f => f.id == fonico ? fonico : "2lpxhZK8JKmvC3nZxR6N")?.disponibilita : [])
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [editingFerie, setEditingFerie] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
    const [selectedFerie, setSelectedFerie] = useState([]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 602);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        if (!isAdmin) {
            setSelectedFonico(fonico)
        }
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleFonicoSelection = (fonicoId) => {
        setSelectedFonico(fonicoId);
        setEditingDisponibilita(false);
    };

    useEffect(() => {
        const fonicoSelezionato = fonici.find(f => f.id === selectedFonico);
        if (fonicoSelezionato) {
            setSelectedFerie(fonicoSelezionato.ferie || []);
            setSelectedDisponibilita(fonicoSelezionato.disponibilita || []);
        }
    }, [fonici, selectedFonico]);

    const handleSetDisponibilita = (code) => {
        if (!editingDisponibilita) return;

        let newDisponibilita = [...selectedDisponibilita];
        if (code === null) {
            for (let i = 10; i <= 22; i++) {
                const fullString = `${day.toDateString()}-${i}`;
                if (newDisponibilita.includes(fullString)) {
                    newDisponibilita = newDisponibilita.filter(d => d !== fullString);
                } else {
                    newDisponibilita.push(fullString);
                }
            }
        } else {
            if (newDisponibilita.includes(code)) {
                newDisponibilita = newDisponibilita.filter(d => d !== code);
            } else {
                newDisponibilita.push(code);
            }
        }
        setSelectedDisponibilita(newDisponibilita)
    };

    const handleSetFerie = (date) => {
        if (!editingFerie) return;

        let newFerie = [...selectedFerie];
        const dateString = new Date(date).toDateString();
        
        if (newFerie.includes(dateString)) {
            newFerie = newFerie.filter(d => d !== dateString);
        } else {
            newFerie.push(dateString);
        }
        setSelectedFerie(newFerie);
    };

    const renderPrenotazioneBlock = (date, hour) => {
        const cellStartTimestamp = new Date(date).setHours(hour, 0, 0, 0);
        const cellEndTimestamp = new Date(date).setHours(hour === 23 ? 0 : hour + 1, 0, 0, 0);

        const prenotazioniForSlot = prenotazioni.filter(p => {
            const inizioTimestamp = p.inizio.seconds * 1000;
            const fineTimestamp = p.fine.seconds * 1000;

            // Controlla che la prenotazione sia nel giorno corretto
            const prenotazioneDate = new Date(inizioTimestamp).setHours(0, 0, 0, 0);
            const cellDate = new Date(date).setHours(0, 0, 0, 0);

            if (prenotazioneDate !== cellDate) {
                return false; // Ignora prenotazioni di giorni diversi
            }

            // Logica per le prenotazioni che attraversano la mezzanotte
            if (inizioTimestamp > fineTimestamp && p.fonico === selectedFonico && p.stato === 2) {
                if (inizioTimestamp <= cellStartTimestamp) {
                    return true;
                }
                if ((cellEndTimestamp <= fineTimestamp)) {
                    return true;
                }
            }

            // Controllo per le prenotazioni normali
            return (
                p.fonico === selectedFonico &&
                p.stato === 2 &&
                (inizioTimestamp < cellEndTimestamp &&
                    fineTimestamp > cellStartTimestamp
                )
            );
        });

        return prenotazioniForSlot.length > 0 ? prenotazioniForSlot.map((p, index) => (
            <div key={index} style={{ backgroundColor: 'grey', margin: '10px', color: isMobile ? "grey" : 'white', width: "100%", whiteSpace: "nowrap", overflow: "hidden" }}>
                {isMobile ? "." : p.nomeUtente}
            </div>
        )) :
            (
                <p style={{ color: "lightgrey", fontSize: "12px" }}>
                    {hour}:00
                </p>
            )
    };

    const renderCalendar = () => {
        const daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
        const daysCode = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const hours = Array.from({ length: 18 }, (_, i) => {
            const hour = (i + 10) % 24; // Calcola l'ora corretta
            return `${hour.toString().padStart(2, '0')}:00`; // Aggiungi lo zero iniziale se necessario
        });
        const startOfWeek = new Date(currentWeek);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        const weekDates = Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000));

        return (
            <div className="calendar-container" style={{ marginTop: "30px", overflowX: "scroll" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <i className="fa-solid fa-arrow-left" style={{ fontSize: "40px" }} onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))}>
                    </i>
                    <h3>Calendario Settimanale</h3>
                    <i className='fa-solid fa-arrow-right' style={{ fontSize: "40px" }} onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))}>
                    </i>
                </div>
                <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', marginTop: '20px', width: '100%' }}>
                    <div></div>
                    {weekDates.map((date, index) => (
                        <div
                            key={index}
                            style={{ textAlign: 'center', fontWeight: 'bold' }}

                        >
                            {
                                isMobile
                                    ? `${date.getDate()}/${date.getMonth() + 1}`
                                    : `${daysOfWeek[index]} ${date.toLocaleDateString().slice(0, -5)}`
                            }

                        </div>
                    ))}
                    {hours.map((hour, hourIndex) => {
                        return (
                            <React.Fragment key={hourIndex}>
                                <div style={{ textAlign: 'center', fontWeight: 'bold', width: "fit-content", marginTop: (hourIndex) % 3 == 0 && hourIndex != 0 ? "30px" : "0px" }}>{hourIndex + 10 > 23 ? `${(hourIndex + 10) - 24}:00` : hour}</div>
                                {weekDates.map((date, dayIndex) => {
                                    let code
                                    switch (Math.floor((hourIndex) / 3)) {
                                        case 0:
                                            code = `${daysCode[date.getDay()]}-10-13`
                                            break
                                        case 1:
                                            code = `${daysCode[date.getDay()]}-13-16`
                                            break
                                        case 2:
                                            code = `${daysCode[date.getDay()]}-16-19`
                                            break
                                        case 3:
                                            code = `${daysCode[date.getDay()]}-19-22`
                                            break
                                        case 4:
                                            code = `${daysCode[date.getDay()]}-22-25`
                                            break
                                        case 5:
                                            code = `${daysCode[date.getDay()]}-25-28`
                                            break
                                    }

                                    return (
                                        <div
                                            key={`${dayIndex}-${hourIndex}`}
                                            style={{
                                                border: '1.5px solid #ddd',
                                                height: '40px',
                                                width: "12vw",
                                                minWidth: isMobile ? "" : "130px",
                                                backgroundColor: selectedFerie.includes(date.toDateString()) 
                                                    ? 'red' 
                                                    : selectedDisponibilita.includes(code) 
                                                        ? 'green' 
                                                        : 'white',
                                                display: "flex",
                                                flexDirection: "row",
                                                marginTop: (hourIndex) % 3 == 0 && hourIndex != 0 ? "30px" : "0px",
                                                alignItems: "center"
                                            }}
                                            onClick={() => {
                                                if (editingDisponibilita) {
                                                    handleSetDisponibilita(code)
                                                } else if (editingFerie) {
                                                    handleSetFerie(date)
                                                }
                                            }}
                                        >
                                            {renderPrenotazioneBlock(date, hourIndex + 10 <= 23 ? hourIndex + 10 : hourIndex - 14) ? renderPrenotazioneBlock(date, hourIndex + 10 <= 23 ? hourIndex + 10 : hourIndex - 14) : <p style={{ color: "lightgrey" }}>00:00</p>}
                                        </div>
                                    )
                                })}
                            </React.Fragment>
                        )
                    })}
                </div>
            </div >
        )
    }

    const handleConferma = () => {
        if (editingDisponibilita) {
            setDisponibilita2(selectedFonico, selectedDisponibilita)
            setEditingDisponibilita(false);
        }
    };

    const handleConfermaFerie = () => {
        setFerie(selectedFonico, selectedFerie)
        console.log("Selected holidays:", selectedFerie);
        setEditingFerie(false);
        setSelectedFerie([]); // Optional: clear selections after confirming
    };


    return (
        <div>
            <Select value={isAdmin ? selectedFonico || '' : fonico} onChange={(e) => handleFonicoSelection(e.target.value)} labelId="fonico-select-label">

                {fonici && isAdmin ? (fonici.map((fonico) => (
                    <MenuItem key={fonico.id} value={fonico.id}>
                        {fonico.nome}
                    </MenuItem>
                )))
                    :
                    (fonici && fonici.filter(f => f.id == fonico).map((fonico) => (
                        <MenuItem key={fonico.id} value={fonico.id}>
                            {fonico.nome}
                        </MenuItem>
                    )))
                }

            </Select>
            {
                isAdmin ?
                    (!editingDisponibilita && !editingFerie && selectedFonico != 1 &&
                        <div className='d-flex flex-row' style={{ gap: "30px" }}>
                            <p variant="primary" style={{ color: "black", borderBottom: "1px solid black", margin: "0px" }} onClick={() => setEditingDisponibilita(true)}>Imposta Disponibilità</p>
                        </div>
                    )

                    :
                    (!editingDisponibilita && !editingFerie &&
                        <div className='d-flex flex-row' style={{ gap: "30px" }}>
                            <p variant="primary" style={{ color: "black", borderBottom: "1px solid black", margin: "0px" }} onClick={() => setEditingDisponibilita(true)}>Imposta Disponibilità</p>
                        </div>
                    )
            }
            {editingDisponibilita && (
                <div style={{ marginTop: '20px' }}>
                    <Button variant="success" onClick={handleConferma} style={{ background: "transparent", border: "1px solid green", color: "green", marginRight: "20px" }}>Conferma</Button>
                    <Button variant="danger" onClick={() => {
                        setSelectedDisponibilita(fonici.find(f => f.id == selectedFonico)?.disponibilita ? fonici.find(f => f.id == selectedFonico)?.disponibilita : []);
                        setEditingDisponibilita(false);
                    }}
                        style={{ background: "transparent", border: "1px solid red", color: "red" }}>Annulla</Button>
                </div>
            )}


            {
                isAdmin ?
                    (!editingFerie && selectedFonico != 1 && !editingDisponibilita &&
                        <div className='d-flex flex-row' style={{ gap: "30px" }}>
                            <p variant="primary" style={{ color: "black", borderBottom: "1px solid black", margin: "0px" }} onClick={() => setEditingFerie(true)}>Seleziona ferie</p>
                        </div>
                    )

                    :
                    (!editingFerie && !editingDisponibilita &&
                        <div className='d-flex flex-row' style={{ gap: "30px" }}>
                            <p variant="primary" style={{ color: "black", borderBottom: "1px solid black", margin: "0px" }} onClick={() => setEditingFerie(true)}>Seleziona ferie</p>
                        </div>
                    )
            }
            {editingFerie && (
                <div style={{ marginTop: '20px' }}>
                    <Button variant="success" onClick={handleConfermaFerie} style={{ background: "transparent", border: "1px solid green", color: "green", marginRight: "20px" }}>Conferma</Button>
                    <Button variant="danger" onClick={() => {
                        //setSelectedDisponibilita(fonici.find(f => f.id == selectedFonico)?.disponibilita ? fonici.find(f => f.id == selectedFonico)?.disponibilita : []);
                        setEditingFerie(false);
                    }}
                        style={{ background: "transparent", border: "1px solid red", color: "red" }}>Annulla</Button>
                </div>
            )}
            {renderCalendar()}
        </div>
    )
}