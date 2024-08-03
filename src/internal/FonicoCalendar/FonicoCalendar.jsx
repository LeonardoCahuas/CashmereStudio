import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import usePrenotazioni from '../../booking/useBooking';

const FonicoCalendar = () => {
    const { fonici, prenotazioni, setDisponibilita } = usePrenotazioni();
    const [selectedFonico, setSelectedFonico] = useState(null);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [editingDisponibilita, setEditingDisponibilita] = useState(false);
    const [selectedDisponibilita, setSelectedDisponibilita] = useState([]);
    const [initialDisponibilita, setInitialDisponibilita] = useState([]);

    useEffect(() => {
        if (fonici.length > 0) {
            setSelectedFonico(fonici[0].id);
        }
    }, [fonici]);

    useEffect(() => {
        if (selectedFonico) {
            const fonico = fonici.find(f => f.id === selectedFonico);
            if (fonico && fonico.disp) {
                const disponibilita = fonico.disp.map(slot => convertSlotToDateTime(slot));
                setSelectedDisponibilita(disponibilita);
                setInitialDisponibilita(disponibilita);
            } else {
                setSelectedDisponibilita([]);
                setInitialDisponibilita([]);
            }
        }
    }, [selectedFonico, fonici]);

    const convertSlotToDateTime = (slot) => {
        const dayOffset = Math.floor((slot - 1) / 13);
        const hourOffset = (slot - 1) % 13;
        const date = new Date(currentWeek);
        date.setDate(date.getDate() - date.getDay() + 1 + dayOffset);
        date.setHours(10 + hourOffset);
        return `${date.toDateString()}-${date.getHours()}`;
    };

    const handleFonicoSelection = (fonicoId) => {
        setSelectedFonico(fonicoId);
        setEditingDisponibilita(false);
    };

    const handleSetDisponibilita = (day, hour = null) => {
        if (!editingDisponibilita) return;

        let newDisponibilita = [...selectedDisponibilita];
        const dateString = `${day.toDateString()}-${hour}`;
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

    const handleConferma = () => {
        const getSlotNumber = (date, hour) => {
            const dayOfWeek = (date.getDay() + 6) % 7;
            const hourOffset = hour - 10;
            return dayOfWeek * 13 + hourOffset + 1;
        };

        const convertDisponibilitaToNumbers = (disponibilita) => {
            return disponibilita.map(d => {
                const [dayString, hour] = d.split('-');
                const date = new Date(dayString);
                return getSlotNumber(date, parseInt(hour, 10));
            }).sort((a, b) => a - b);
        };

        const disponibilitaNumeri = convertDisponibilitaToNumbers(selectedDisponibilita);
        setDisponibilita(selectedFonico, disponibilitaNumeri);
        setEditingDisponibilita(false);
    };

    const renderCalendar = () => {
        const daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
        const hours = Array.from({ length: 13 }, (_, i) => `${i + 10}:00`);
        const startOfWeek = new Date(currentWeek);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        const weekDates = Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000));

        return (
            <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="secondary" onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))}>
                        Settimana Precedente
                    </Button>
                    <h3>Calendario Settimanale</h3>
                    <Button variant="secondary" onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))}>
                        Settimana Successiva
                    </Button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', marginTop: '20px', width: '100%' }}>
                    <div></div>
                    {weekDates.map((date, index) => (
                        <div
                            key={index}
                            style={{ textAlign: 'center', fontWeight: 'bold', cursor: editingDisponibilita ? 'pointer' : 'default' }}
                            onClick={() => editingDisponibilita && handleSetDisponibilita(date)}
                        >
                            {daysOfWeek[index]} {date.toLocaleDateString()}
                        </div>
                    ))}
                    {hours.map((hour, hourIndex) => (
                        <React.Fragment key={hourIndex}>
                            <div style={{ textAlign: 'center', fontWeight: 'bold', width: "fit-content" }}>{hour}</div>
                            {weekDates.map((date, dayIndex) => (
                                <div
                                    key={`${dayIndex}-${hourIndex}`}
                                    style={{
                                        border: '1px solid #ddd',
                                        height: '40px',
                                        width: "200px",
                                        backgroundColor: getCellColor(date, hourIndex + 10),
                                        cursor: editingDisponibilita ? 'pointer' : 'default'
                                    }}
                                    onClick={() => editingDisponibilita && handleSetDisponibilita(date, hourIndex + 10)}
                                >
                                    {renderPrenotazioneBlock(date, hourIndex + 10)}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    const getCellColor = (date, hour) => {
        const dateString = `${date.toDateString()}-${hour}`;
        const cellStartTimestamp = new Date(date).setHours(hour, 0, 0, 0);
        const cellEndTimestamp = new Date(date).setHours(hour + 1, 0, 0, 0);

        if (editingDisponibilita) {
            return selectedDisponibilita.includes(dateString) ? 'green' : 'white';
        } else if (initialDisponibilita.includes(dateString)) {
            return 'green';
        }

        // Verifica se c'è una prenotazione per lo slot corrente
        const isPrenotato = prenotazioni.some(p => {
            const inizioTimestamp = new Date(p.inizio).getTime();
            const fineTimestamp = new Date(p.fine).getTime();
            if(p.fonico && p.fonicoId === selectedFonico){
                console.log("fonico trovato")
            }
            return (
                inizioTimestamp < cellEndTimestamp && fineTimestamp > cellStartTimestamp && p.fonicoId === selectedFonico
            );
        });

        return isPrenotato ? 'lightgrey' : 'white';
    };


    const renderPrenotazioneBlock = (date, hour) => {
        const cellStartTimestamp = new Date(date).setHours(hour, 0, 0, 0);
        const cellEndTimestamp = new Date(date).setHours(hour + 1, 0, 0, 0);

        const prenotazioniForSlot = prenotazioni.filter(p => {
            return (
                p.inizio.seconds < (cellEndTimestamp / 1000) && p.fine.seconds > (cellStartTimestamp / 1000) && p.fonico === selectedFonico
            );
        });

        return prenotazioniForSlot.map((p, index) => (
            <div key={index} style={{ backgroundColor: 'grey', margin: '2px', color: 'white' }}>
                {p.nomeUtente}
            </div>
        ));
    };




    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <select value={selectedFonico || ''} onChange={(e) => handleFonicoSelection(e.target.value)}>
                    {fonici && fonici.map((fonico) => (
                        <option key={fonico.id} value={fonico.id}>
                            {fonico.nome}
                        </option>
                    ))}
                </select>
                <Button variant="primary" onClick={() => setEditingDisponibilita(true)}>Imposta Disponibilità</Button>
            </div>
            {renderCalendar()}

            {editingDisponibilita && (
                <div style={{ marginTop: '20px' }}>
                    <Button variant="success" onClick={handleConferma}>Conferma</Button>
                    <Button variant="danger" onClick={() => {
                        setSelectedDisponibilita(initialDisponibilita);
                        setEditingDisponibilita(false);
                    }}>Annulla</Button>
                </div>
            )}
        </div>
    );
};

export default FonicoCalendar;