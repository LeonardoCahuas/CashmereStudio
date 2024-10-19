import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import usePrenotazioni from '../../../booking/useBooking';

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
        const hours = Array.from({ length: 18 }, (_, i) => `${(i + 10).toString().padStart(2, '0')}:00`);
        const startOfWeek = new Date(currentWeek);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        const weekDates = Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000));

        const renderDisponibilitaBlock = (date, hour) => {
            const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
            const slotStart = Math.floor(hour / 3) * 3;
            const slotEnd = slotStart + 3;
            const slotCode = `${dayOfWeek}-${slotStart}-${slotEnd}`;

            const availableFonici = fonici.filter(f => f.id != 1).filter(fonico => {
                // Check if the fonico is available for this slot
                const isAvailable = fonico.disponibilita?.includes(slotCode);

                if (!isAvailable) return false;

                // Check if there's a booking that conflicts with this hour
                const hasConflictingBooking = prenotazioni.some(p => {
                    const start = new Date(p.inizio.seconds * 1000);
                    const end = new Date(p.fine.seconds * 1000);
                    return p.fonico === fonico.id &&
                        date.getTime() >= start.setHours(0, 0, 0, 0) &&
                        date.getTime() <= end.setHours(23, 59, 59, 999) &&
                        hour >= start.getHours() &&
                        hour < end.getHours();
                });

                return !hasConflictingBooking;
            });

            return (
                <div style={{
                    border: '1px solid #ddd',
                    width: "12vw",
                    minWidth: isMobile ? "100px" : "130px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    overflow: "hidden",
                    height: '40px'
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
        };

        return (
            <div className="calendar-container" style={{ marginTop: "30px" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <i className="fa-solid fa-arrow-left" style={{ fontSize: "40px" }} onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))}></i>
                    <h3>Calendario Disponibilità Settimanale</h3>
                    <i className='fa-solid fa-arrow-right' style={{ fontSize: "40px" }} onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))}></i>
                </div>in 
                <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', marginTop: '20px' }}>
                    <div></div>
                    {weekDates.map((date, index) => (
                        <div key={index} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                            {isMobile ? `${date.getDate()}/${date.getMonth() + 1}` : `${daysOfWeek[index]} ${date.toLocaleDateString().slice(0, -5)}`}
                        </div>
                    ))}
                    {hours.map((hour, hourIndex) => (
                        <React.Fragment key={hourIndex}>
                            <div style={{ textAlign: 'end', fontWeight: 'bold', width: "100%" }}>{hour}</div>
                            {weekDates.map((date, dayIndex) => (
                                <React.Fragment key={dayIndex}>
                                    {renderDisponibilitaBlock(date, hourIndex + 10)}
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                    ))}
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
