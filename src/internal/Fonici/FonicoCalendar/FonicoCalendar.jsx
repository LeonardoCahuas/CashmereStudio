import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { InputLabel, MenuItem, Select } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import usePrenotazioni from '../../../contexts/PrenotazioniContext';

const FonicoCalendar = ({ fonico, isAdmin }) => {
    const { fonici, prenotazioni, setDisponibilita, setNonDisponibilita } = usePrenotazioni();
    const [selectedFonico, setSelectedFonico] = useState(fonico ? fonico : "2lpxhZK8JKmvC3nZxR6N");
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [editingDisponibilita, setEditingDisponibilita] = useState(false);
    const [editingNonDisponibilita, setEditingNonDisponibilita] = useState(false);
    const [selectedDisponibilita, setSelectedDisponibilita] = useState([]);
    const [initialDisponibilita, setInitialDisponibilita] = useState([]);
    const [selectedNonDisponibilita, setSelectedNonDisponibilita] = useState([]);
    const [initialNonDisponibilita, setInitialNonDisponibilita] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
    const [refreshKey, setRefreshKey] = useState(0);


    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 602);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Call initially to set the correct state
        if (!isAdmin) {
            setSelectedFonico(fonico)
        }

        let ogg = {}
        let array1 = []
        /* fonici.forEach((f) => {
            ogg[f.nome] = []
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < f.disp.length; j++) {
                    if (
                        f.disp[j] > 13 * i
                        &&
                        f.disp[j] <= 13 * (i + 1)
                    ) {
                        ogg[f.nome].push(f.disp[j] + i * 5)
                    }
                }
            }
            setDisponibilita(f.id, ogg[f.nome])
            console.log(f.disp)
            console.log(ogg[f.nome])
            console.log(f.nome)
        })
        console.log(ogg) */




        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (fonici.length > 0 && selectedFonico === null) {
            setSelectedFonico(fonici[1].id);
        }
    }, [fonici, selectedFonico]);


    useEffect(() => {
        if (selectedFonico) {
            const fonico = fonici.find(f => f.id === selectedFonico);
            if (fonico) {
                const nonDisponibilita = fonico.nondisp ? fonico.nondisp.map(slot => convertSlotToDateTime(slot)) : [];
                const disponibilita = fonico.disp ? fonico.disp.map(slot => convertSlotToDateTime(slot)) : [];
                console.log(fonico.disp.length)
                setSelectedDisponibilita(disponibilita);
                setInitialDisponibilita(disponibilita);
                setSelectedNonDisponibilita(nonDisponibilita);
                setInitialNonDisponibilita(nonDisponibilita);
                console.log(disponibilita)
            } else {
                setSelectedDisponibilita([]);
                setSelectedNonDisponibilita([]);
                setInitialDisponibilita([]);
                setInitialNonDisponibilita([]);
            }
        }
    }, [selectedFonico, fonici, currentWeek])


    const convertSlotToDateTime = (slot) => {
        console.log(slot)
        const dayOffset = Math.floor((slot - 1) / 18);
        const hourOffset = (slot - 1) % 18;
        console.log("dayoff " + dayOffset)
        console.log("houroff "+ hourOffset)

        const date = new Date(currentWeek);
        date.setDate(date.getDate() - date.getDay() + 1 + dayOffset);
        date.setHours(10 + hourOffset);
        console.log(date.getHours())
        console.log(`${date.toDateString()}-${date.getHours()}`)
        return `${date.toDateString()}-${date.getHours()}`;
    };


    const handleFonicoSelection = (fonicoId) => {
        setSelectedFonico(fonicoId);
        setEditingDisponibilita(false);
        setEditingNonDisponibilita(false);
    };

    const handleSetDisponibilita = (day, hour = null) => {
        if (!editingDisponibilita) return;

        let newDisponibilita = [...selectedDisponibilita];
        const dateString = `${day.toDateString()}-${hour}`;
        console.log(`${day.toDateString()}-${hour}`)
        if (hour === null) {
            for (let i = 10; i <= 22; i++) {
                const fullString = `${day.toDateString()}-${i}`;
                if (newDisponibilita.includes(fullString)) {
                    newDisponibilita = newDisponibilita.filter(d => d !== fullString);
                } else {
                    newDisponibilita.push(fullString);
                }
            }
        } else {
            if (newDisponibilita.includes(dateString)) {
                newDisponibilita = newDisponibilita.filter(d => d !== dateString);
            } else {
                newDisponibilita.push(dateString);
            }
        }

        setSelectedDisponibilita(newDisponibilita);
    };

    const handleSetNonDisponibilita = (day, hour = null) => {
        if (!editingNonDisponibilita) return;

        let newNonDisponibilita = [...selectedNonDisponibilita];
        const dateString = `${day.toDateString()}-${hour}`;
        if (hour === null) {
            for (let i = 10; i <= 22; i++) {
                const fullString = `${day.toDateString()}-${i}`;
                if (newNonDisponibilita.includes(fullString)) {
                    newNonDisponibilita = newNonDisponibilita.filter(d => d !== fullString);
                } else {
                    newNonDisponibilita.push(fullString);
                }
            }
        } else {
            if (newNonDisponibilita.includes(dateString)) {
                newNonDisponibilita = newNonDisponibilita.filter(d => d !== dateString);
            } else {
                newNonDisponibilita.push(dateString);
            }
        }

        setSelectedNonDisponibilita(newNonDisponibilita);
    };

    const handleConferma = () => {
        console.log("editando disp o non disp")
        console.log(selectedDisponibilita)
        const getSlotNumber = (date, hour) => {
            console.log("date " + date)
            console.log("hour " + hour)
            const dayOfWeek = (date.getDay() + 6) % 7;
            let hourOffset;
            console.log("numero giorno" + dayOfWeek)

            if (hour >= 10 && hour <= 23) {
                hourOffset = hour - 10;
            }
            else if (hour >= 0 && hour < 5) {
                hourOffset = hour + 14;
            }
            console.log("ora offset " + hourOffset)
            return dayOfWeek * 18 + hourOffset + 1; // Calcola il numero dello slot
        };


        const convertDisponibilitaToNumbers = (disponibilita) => {
            return disponibilita.map(d => {
                const [dayString, hour] = d.split('-');
                const date = new Date(dayString);
                return getSlotNumber(date, parseInt(hour, 10));
            }).sort((a, b) => a - b);
        };

        let disponibilitaNumeri
        if (editingDisponibilita) {

            disponibilitaNumeri = convertDisponibilitaToNumbers(selectedDisponibilita);
            console.log(disponibilitaNumeri)
            const newNonDisp = fonici.find(f => f.id == selectedFonico)?.nondisp?.filter(elemento => !disponibilitaNumeri.includes(elemento))
            if (newNonDisp?.length < initialNonDisponibilita.length) {
                setNonDisponibilita(selectedFonico, newNonDisp);
                setInitialNonDisponibilita(newNonDisp)
            }
            console.log(selectedFonico)
            console.log(disponibilitaNumeri)
            setDisponibilita(selectedFonico, disponibilitaNumeri);
            setInitialDisponibilita(disponibilitaNumeri)
            setEditingDisponibilita(false);
        } else if (editingNonDisponibilita) {
            disponibilitaNumeri = convertDisponibilitaToNumbers(selectedNonDisponibilita);
            const newDisp = fonici.find(f => f.id == selectedFonico)?.disp?.filter(elemento => !disponibilitaNumeri.includes(elemento))
            if (newDisp?.length < initialDisponibilita.length) {
                setDisponibilita(selectedFonico, newDisp);
                setInitialDisponibilita(newDisp)
            }
            setInitialNonDisponibilita(disponibilitaNumeri)
            setNonDisponibilita(selectedFonico, disponibilitaNumeri);
            setEditingNonDisponibilita(false)
        }

        setRefreshKey(prevKey => prevKey + 1);
    };


    const renderCalendar = () => {
        const daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
        const hours = Array.from({ length: 18 }, (_, i) => {
            const hour = (i + 10) % 24; // Calcola l'ora corretta
            return `${hour.toString().padStart(2, '0')}:00`; // Aggiungi lo zero iniziale se necessario
        });
        const startOfWeek = new Date(currentWeek);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        const weekDates = Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000));

        return (
            <div key={refreshKey} className="calendar-container" style={{ marginTop: "30px", overflowX: "scroll" }}>
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
                            onClick={() => {
                                if (editingDisponibilita) {
                                    handleSetDisponibilita(date)
                                } else if (editingNonDisponibilita) {
                                    handleSetNonDisponibilita(date)
                                }
                            }
                            }
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
                                <div style={{ textAlign: 'center', fontWeight: 'bold', width: "fit-content" }}>{hour}</div>
                                {weekDates.map((date, dayIndex) => (
                                    <div
                                        key={`${dayIndex}-${hourIndex}`}
                                        style={{
                                            border: '1px solid #ddd',
                                            height: '40px',
                                            width: "12vw",
                                            minWidth: isMobile ? "" : "130px",
                                            backgroundColor: getCellColor(date, hourIndex + 10 <= 23 ? hourIndex + 10 : hourIndex - 14),
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center"
                                        }}
                                        onClick={() => {
                                            console.log(hourIndex + 10 <= 23 ? hourIndex + 10 : hourIndex - 14)
                                            if (editingDisponibilita) {
                                                handleSetDisponibilita(date, hourIndex + 10 <= 23 ? hourIndex + 10 : hourIndex - 14)
                                            } else if (editingNonDisponibilita) {
                                                handleSetNonDisponibilita(date, hourIndex + 10 <= 23 ? hourIndex + 10 : hourIndex - 14)
                                            }
                                        }}
                                    >
                                        {renderPrenotazioneBlock(date, hourIndex + 10 <= 23 ? hourIndex + 10 : hourIndex - 14)}
                                    </div>
                                ))}
                            </React.Fragment>
                        )
                    })}
                </div>
            </div >
        );
    };

    const getCellColor = (date, hour) => {
        const dateString = `${date.toDateString()}-${hour}`;
        const cellStartTimestamp = new Date(date).setHours(hour, 0, 0, 0);
        const cellEndTimestamp = new Date(date).setHours(hour + 1, 0, 0, 0);

        if (editingDisponibilita) {
            return selectedDisponibilita.includes(dateString) ? 'green' : selectedNonDisponibilita.includes(dateString) ? 'red' : 'white';
        } else if (editingNonDisponibilita) {
            return selectedNonDisponibilita.includes(dateString) ? 'red' : selectedDisponibilita.includes(dateString) ? 'green' : 'white';
        } else if (initialNonDisponibilita.includes(dateString)) {
            return 'red';
        } else if (initialDisponibilita.includes(dateString)) {
            return 'green';
        } else {
            return 'white'
        }
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

        return prenotazioniForSlot.map((p, index) => (
            <div key={index} style={{ backgroundColor: 'grey', margin: '10px', color: isMobile ? "grey" : 'white', width: "100%", whiteSpace: "nowrap", overflow: "hidden" }}>
                {isMobile ? "." : p.nomeUtente}
            </div>
        ));
    };


    return (
        <div style={{ marginBottom: "50px", width: "100%", display: "flex", flexDirection: "column", alignItems: "start" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

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
                {editingDisponibilita && (
                    <div style={{ marginTop: '20px' }}>
                        <Button variant="success" onClick={handleConferma} style={{ background: "transparent", border: "1px solid green", color: "green", marginRight: "20px" }}>Conferma</Button>
                        <Button variant="danger" onClick={() => {
                            setSelectedDisponibilita(initialDisponibilita);
                            setEditingDisponibilita(false);
                        }}
                            style={{ background: "transparent", border: "1px solid red", color: "red" }}>Annulla</Button>
                    </div>
                )}
                {editingNonDisponibilita && (
                    <div style={{ marginTop: '20px' }}>
                        <Button variant="success" onClick={handleConferma} style={{ background: "transparent", border: "1px solid green", color: "green", marginRight: "20px" }}>Conferma</Button>
                        <Button variant="danger" onClick={() => {
                            setSelectedNonDisponibilita(initialNonDisponibilita);
                            setEditingNonDisponibilita(false);
                        }}
                            style={{ background: "transparent", border: "1px solid red", color: "red" }}>Annulla</Button>
                    </div>
                )}
                {
                    isAdmin ?
                        (!editingDisponibilita && !editingNonDisponibilita && selectedFonico != 1 &&
                            <div className='d-flex flex-row' style={{ gap: "30px" }}>
                                <p variant="primary" style={{ color: "black", borderBottom: "1px solid black", margin: "0px" }} onClick={() => setEditingDisponibilita(true)}>Imposta Disponibilità</p>
                                <p variant="primary" style={{ color: "black", borderBottom: "1px solid black", margin: "0px" }} onClick={() => setEditingNonDisponibilita(true)}>Imposta Non Disponibilità</p>
                            </div>
                        )

                        :
                        (!editingDisponibilita && !editingNonDisponibilita &&
                            <div className='d-flex flex-row' style={{ gap: "30px" }}>
                                <p variant="primary" style={{ color: "black", borderBottom: "1px solid black", margin: "0px" }} onClick={() => setEditingDisponibilita(true)}>Imposta Disponibilità</p>
                                <p variant="primary" style={{ color: "black", borderBottom: "1px solid black", margin: "0px" }} onClick={() => setEditingNonDisponibilita(true)}>Imposta Non Disponibilità</p>
                            </div>
                        )
                }

            </div>
            {renderCalendar()}
        </div>
    );
};

export default FonicoCalendar;
