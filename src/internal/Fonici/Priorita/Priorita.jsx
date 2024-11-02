import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import usePrenotazioni from '../../../booking/useBooking';

export const Priority = () => {
    const { fonici, setDisponibilitaPriority, disponibilitaOre } = usePrenotazioni();
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderedFonici, setOrderedFonici] = useState([]);

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

    const handleSlotClick = (slot) => {
        setSelectedSlot(slot);
        setShowModal(true);
        setIsOrdering(false);
        console.log(disponibilitaOre)
        const existingOrder = disponibilitaOre.find(d => d.ore === slot);
        console.log(existingOrder)
        if (existingOrder && existingOrder.fonici) {
            console.log("ciao")
            const orderedFoniciList = existingOrder.fonici.map(id => {
                const fonico = fonici.find(f => f.id === id);
                return fonico ? { id: fonico.id, nome: fonico.nome } : null;
            }).filter(f => f !== null);
            setOrderedFonici(orderedFoniciList);
        } else {
            setOrderedFonici([]);
        }
    };

    const handleStartOrdering = () => {
        setIsOrdering(true);
        setOrderedFonici([]);
    };

    const handleFonicoClick = (fonicoId) => {
        if (!isOrdering) return;

        setOrderedFonici(prev => {
            const fonico = fonici.find(f => f.id === fonicoId);
            if (!fonico) return prev;

            if (prev.some(f => f.id === fonicoId)) {
                return prev.filter(f => f.id !== fonicoId);
            } else {
                return [...prev, { id: fonico.id, nome: fonico.nome }];
            }
        });
    };

    const handleConfirmOrder = () => {
        console.log(orderedFonici.map(f => f.id));
        setDisponibilitaPriority(selectedSlot, orderedFonici.map(f => f.id));
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsOrdering(false);
    };

    const renderPrioritySlots = () => {
        const daysCode = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
        const hoursSlots = ['10-13', '13-16', '16-19', '19-22', '22-25', '25-28'];
        const startOfWeek = new Date(currentWeek);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        const weekDates = Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000));

        return (
            <div className="priority-container" style={{ marginTop: "30px" }}>
                <div className="priority-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', marginTop: '20px', width: '100%' }}>
                    <div></div>
                    {weekDates.map((date, index) => (
                        <div key={index} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                            {isMobile ? `${date.getDate()}/${date.getMonth() + 1}` : `${daysOfWeek[index]} ${date.toLocaleDateString().slice(0, -5)}`}
                        </div>
                    ))}
                    {hoursSlots.map((slot, slotIndex) => {
                         const [startHour, endHour] = slot.split('-').map(Number); // Estrai le ore di inizio e fine
                         const displayStartHour = startHour > 23 ? `${startHour - 24}` : startHour; // Modifica la visualizzazione se startHour > 23
                         const displayEndHour = endHour > 24 ? `${endHour - 24}` : endHour; // Modifica la visualizzazione se endHour > 24
                         const displaySlot = `${displayStartHour}-${displayEndHour}`;
                        return (
                            <React.Fragment key={slotIndex}>
                                <div style={{ textAlign: 'center', fontWeight: 'bold', width: "50px" }}>{displaySlot}</div>
                                {weekDates.map((date, dayIndex) => {
                                    const slotCode = `${daysCode[date.getDay()]}-${slot}`;
                                    return (
                                        <div
                                            key={`${dayIndex}-${slotIndex}`}
                                            style={{
                                                border: '1.5px solid #ddd',
                                                minWidth: isMobile ? "" : "130px",
                                                backgroundColor: 'white',
                                                display: "flex",
                                                flexDirection: "row",
                                                flexWrap: "wrap",
                                                marginTop: "0px",
                                                alignItems: "center", gap: "5px",
                                                padding: "3px"
                                            }}
                                            onClick={() => handleSlotClick(slotCode)}
                                        >
                                            {fonici
                                                .filter(f => {
                                                    // Verifica prima se il fonico è disponibile per lo slot
                                                    const isAvailable = f.disponibilita?.includes(slotCode);
                                                    
                                                    // Verifica se il fonico NON è in ferie per questa data
                                                    const isNotFerie = !f.ferie?.some(ferieDate => 
                                                        new Date(ferieDate).toLocaleDateString() === date.toLocaleDateString()
                                                    );
                                                    
                                                    return isAvailable && isNotFerie;
                                                })
                                                .map(fonico => (
                                                    <div 
                                                        key={fonico.id} 
                                                        style={{ 
                                                            color: 'black', 
                                                            padding: "3px", 
                                                            borderRadius: "3px", 
                                                            border: "1px solid black" 
                                                        }}
                                                    >
                                                        {fonico.nome}
                                                    </div>
                                                ))}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div style={{ width: "90vw", overflowX: "scroll" }}>
            {renderPrioritySlots()}

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Fonici disponibili per {selectedSlot}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {(isOrdering ? fonici.filter(f => f.disponibilita?.includes(selectedSlot)) : orderedFonici).map((fonico, index) => (
                            <li 
                                key={fonico.id} 
                                onClick={() => handleFonicoClick(fonico.id)}
                                style={{ cursor: isOrdering ? 'pointer' : 'default', padding: '5px 0' }}
                            >
                                {fonico.nome}
                                {!isOrdering && 
                                    <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                                        {index + 1}
                                    </span>
                                }
                                {isOrdering && orderedFonici.some(f => f.id === fonico.id) && 
                                    <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                                        {orderedFonici.findIndex(f => f.id === fonico.id) + 1}
                                    </span>
                                }
                            </li>
                        ))}
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    {!isOrdering && (
                        <Button variant="primary" onClick={handleStartOrdering}>
                            Ordina
                        </Button>
                    )}
                    {isOrdering && (
                        <Button 
                            variant="success" 
                            onClick={handleConfirmOrder}
                            disabled={orderedFonici.length !== fonici.filter(f => f.disponibilita?.includes(selectedSlot)).length}
                        >
                            Conferma
                        </Button>
                    )}
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Chiudi
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
