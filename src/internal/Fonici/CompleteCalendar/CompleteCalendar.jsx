import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import usePrenotazioni from '../../../contexts/PrenotazioniContext';

const CompleteCalendar = ({ isAdmin }) => {
    const { fonici, prenotazioni } = usePrenotazioni();
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 602);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const renderCalendar = () => {
        const daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
        const daysCode = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const hours = Array.from({ length: 18 }, (_, i) => `${(i + 10).toString().padStart(2, '0')}:00`);
        const startOfWeek = new Date(currentWeek);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        const weekDates = Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000));

        const getAvailableFonici = (date, hour) => {
            const dayCode = daysCode[date.getDay()];

            const slotStart = hour; // Inizio dello slot

            const slotEnd = slotStart + 3;

            return fonici.filter(fonico => {
                if (fonico.id == 1) return false; // Ignora fonico con ID 1

                // Controlla disponibilità
                const isAvailable = fonico.disponibilita?.some(d => {
                    const [day, start, end] = d.split('-');

                    return day === dayCode && slotStart >= parseInt(start) && slotStart < parseInt(end);
                });
                let isNotFerie = true;
                // Controlla se la data NON è in ferie
                isNotFerie = !fonico.ferie?.some(d => {
                    return new Date(d).toLocaleDateString() === date.toLocaleDateString();
                });

                if (!isAvailable || !isNotFerie) return false;

                // Controlla prenotazioni
                const hasConflictingBooking = prenotazioni.some(p => {
                    if (p.fonico !== fonico.id || p.stato !== 2) return false;

                    const start = new Date(p.inizio.seconds * 1000);
                    const end = new Date(p.fine.seconds * 1000);

                    // Gestione prenotazioni che attraversano la mezzanotte


                    const slotStartTime = new Date(date).setHours(hour, 0, 0, 0);
                    const slotEndTime = new Date(date).setHours(hour + 1, 0, 0, 0);
                    if (start > end) {
                        end.setDate(end.getDate() + 1);
                    }

                    const limite = new Date(start);
                    limite.setHours(10, 0, 0, 0); // Imposta l'ora a 10:00:00

                    // Controllo se sia start che end sono prima delle 10:00
                    if (start < limite && end < limite) {
                        start.setDate(start.getDate() + 1);
                        end.setDate(end.getDate() + 1);
                    }


                    return (start < slotEndTime && end > slotStartTime);
                });

                return !hasConflictingBooking;
            });
        };

        return (
            <div className="calendar-container" style={{ marginTop: "30px" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <i className="fa-solid fa-arrow-left" style={{ fontSize: "40px" }} onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))}></i>
                    <h3>Calendario Disponibilità Settimanale</h3>
                    <i className='fa-solid fa-arrow-right' style={{ fontSize: "40px" }} onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))}></i>
                </div>
                <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', marginTop: '20px' }}>
                    <div></div>
                    {weekDates.map((date, index) => (
                        <div key={index} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                            {isMobile ? `${date.getDate()}/${date.getMonth() + 1}` : `${daysOfWeek[index]} ${date.toLocaleDateString().slice(0, -5)}`}
                        </div>
                    ))}
                    {hours.map((hour, hourIndex) => {
                        return (
                            <React.Fragment key={hourIndex}>
                                <div style={{ textAlign: 'end', fontWeight: 'bold', width: "100%" }}>
                                    {hourIndex + 10 > 23 ? `${(hourIndex + 10) - 24}:00` : hour}
                                </div>
                                {weekDates.map((date, dayIndex) => {
                                    const availableFonici = getAvailableFonici(date, hourIndex + 10);

                                    return (
                                        <div key={`${dayIndex}-${hourIndex}`} style={{
                                            border: '1px solid #ddd',
                                            width: "12vw",
                                            minWidth: isMobile ? "100px" : "130px",
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                        }}>
                                            {availableFonici.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: "row", flexWrap: 'wrap', gap: "5px", padding: "5px" }}>
                                                    {availableFonici.map((fonico, index) => (
                                                        <span key={index} style={{ marginRight: '5px', backgroundColor: 'lightgreen', padding: '2px 5px', borderRadius: '5px', fontSize: isMobile ? "10px" : "12px" }}>
                                                            {fonico.nome}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'gray', fontSize: '12px', padding: '5px' }}>Nessun fonico</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>
        );
    };

    return (
        <div style={{ marginBottom: "50px", width: "100%", display: "flex", flexDirection: "column", alignItems: "start", overflowX: "scroll" }}>
            {renderCalendar()}
        </div>
    );
};

export default CompleteCalendar;