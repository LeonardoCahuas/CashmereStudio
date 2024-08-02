import React, { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Box, MenuItem, Select, FormControl, InputLabel, Button as MuiButton } from '@mui/material';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import usePrenotazioni from '../../booking/useBooking';

import { Table, Button, Modal, Form } from 'react-bootstrap';

const months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const giorniSettimana = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

const NextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} slick-next flex-column align-items-center justify-content-center`}
            style={{ ...style, borderRadius: '50%', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", right: "-0px" }}
            onClick={onClick}
        >
            <i className="fa-solid fa-chevron-right" style={{ color: "black", fontSize: "40px", right: '0px', backgroundColor: "white", width: "40px", height: "40px", borderRadius: '50%', position: "absolute", top: "-0px", left: "-2.5px" }}></i>
        </div>
    );
};

const PrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} slick-prev flex-column align-items-center justify-content-center`}
            style={{ ...style, borderRadius: '50%', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", left: "-0px" }}
            onClick={onClick}
        >
            <i className="fa-solid fa-chevron-left" style={{ color: "black", fontSize: "40px", left: '0px', backgroundColor: "white", width: "40px", height: "40px", borderRadius: '50%', position: "absolute", top: "-0px", left: "-2.5px" }}></i>
        </div>
    );
};

const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 2,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    className: 'custom-slider',
    rows: 1
};

const getFormattedDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getMonthDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const endDate = new Date(year, month, day + 27); // Data 28 giorni dopo
    const daysInMonth = Math.min(Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)), 28);
    const firstDayOfMonth = today.getDay(); // Ottieni il giorno della settimana del primo giorno del mese
    const days = [];

    for (let i = 0; i < daysInMonth; i++) {
        const date = new Date(year, month, day + i);
        days.push({
            label: `${giorniSettimana[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`,
            date: getFormattedDate(date),
        });
    }

    // Aggiungi giorni vuoti per allineare i giorni correttamente nella settimana
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.unshift(null);
    }

    return days;
};

const getCurrentWeek = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek + 1); // Lunedì della settimana corrente
    const weekDays = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        weekDays.push({
            label: `${giorniSettimana[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`,
            date: getFormattedDate(date),
        });
    }

    return weekDays;
};

const Calendar = () => {
    const [value, setValue] = useState(1);
    const [selectedDay, setSelectedDay] = useState(getFormattedDate(new Date()));
    const [showModal, setShowModal] = useState(false);
    const [studioBookings, setStudioBookings] = useState([]);
    const [selectedPrenotazione, setSelectedPrenotazione] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
    const [view, setView] = useState('weekly'); // 'daily' or 'weekly'
    const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
    const [blockMode, setBlockMode] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [serviceModalShow, setServiceModalShow] = useState(false);
    const [services, setServices] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState(null)
    const [repeat, setRepeat] = useState(null)
    const [selectedFonico, setSelectedFonico] = useState(0)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isEditing, setIsEditing] = useState(false);



    const { prenotazioni, addPrenotazione, fonici } = usePrenotazioni(selectedDay);
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');

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

    const handleChange = (event, newValue) => {
        setValue(newValue + 1);
    };

    const handleShowModal = (prenotazione) => {
        setSelectedPrenotazione(prenotazione);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedPrenotazione(null);
        setShowModal(false);
    };

    const handleServiceModalClose = () => setServiceModalShow(false);

    const handleServiceModalOpen = () => setServiceModalShow(true);

    const toggleBlockMode = () => {
        setBlockMode(!blockMode);
        setSelectedSlots([]);
    };

    const handleDelete = () => {
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = () => {
        // Implementa la logica di eliminazione
        setShowDeleteConfirmation(false);
        handleCloseModal(); // Chiude la finestra modale principale se è aperta
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false);
    };


    const handleFonicoSelection = (fonico) => {
        console.log(fonico)
        setSelectedFonico(fonico)
    }

    const handleSlotClick = (date, hour) => {
        const slot = `${date}T${hour}:00`;
        if (selectedSlots.includes(slot)) {
            setSelectedSlots(selectedSlots.filter(s => s !== slot));
        } else {
            setSelectedSlots([...selectedSlots, slot]);
        }
    };

    const handleNext = () => {
        if (selectedSlots.length) {
            handleServiceModalOpen();
        }
    };

    const handleInsert = () => {
        selectedSlots.forEach(slot => {
            const [date, time] = slot.split('T');
            const [hour] = time.split(':');
            let inizio = new Date(`${date}T${time}`);
            let fine = new Date(inizio);
            fine.setHours(inizio.getHours() + 1);

            for (let i = 0; i < (repeat || 1); i++) {
                const newInizio = new Date(inizio);
                const newFine = new Date(fine);
                newInizio.setDate(inizio.getDate() + i * 7);
                newFine.setDate(fine.getDate() + i * 7);

                console.log({
                    nomeUtente: username || 'Blocco',
                    studio: value,
                    telefono: phoneNumber || 'Blocco',
                    services,
                    inizio: newInizio,
                    fine: newFine,
                    stato: 2,
                });

                addPrenotazione({
                    nomeUtente: username || 'Blocco',
                    studio: value,
                    telefono: phoneNumber || 'Blocco',
                    services,
                    inizio: newInizio,
                    fine: newFine,
                    stato: 2,
                });
            }
        });
        setSelectedSlots([]);
        handleServiceModalClose();
    };

    const handleSaveChanges = () => {
        // Aggiungi logica per salvare le modifiche qui
        console.log('Modifiche salvate');
        setIsEditing(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleServiceChange = (e) => {
        const value = e.target.value;
        setServices(prevServices =>
          e.target.checked ? [...prevServices, value] : prevServices.filter(service => service !== value)
        );
      };


    useEffect(() => {
        if (selectedDay) {
            let newPren = prenotazioni.filter((pren) => pren.studio === value && pren.inizio.toDate().toLocaleDateString() === new Date(selectedDay).toLocaleDateString());
            setStudioBookings(newPren);
        } else {
            setStudioBookings([]);
        }
    }, [prenotazioni, value, selectedDay]);

    const renderDays = () => {
        return (
            <div className="w-100 d-flex flex-column custom-slider-container">
                <Slider {...settings} className="week-slider custom-slider w-100" style={{ height: '150px', padding: '30px' }}>
                    {getMonthDays()
                        .filter((day) => day)
                        .map((day, index) => (
                            <div key={index} className="day-slide" style={{ width: '200px', backgroundColor: "transparent" }}>
                                <button
                                    className={`day-button ${day.date === selectedDay ? 'selected' : ''} d-flex flex-column justify-content-center`}
                                    onClick={() => setSelectedDay(day.date)}
                                    style={{ width: '200px', backgroundColor: "white", border: day.date === selectedDay ? "2px solid #08B1DF" : "2px solid black", color: day.date === selectedDay ? "white" : "black", textAlign: "start" }}
                                >
                                    <p className='text-start w-75 fs-5'>
                                        {`${giorniSettimana[new Date(day.date).getDay()]}`}
                                    </p>
                                    <p className='text-start w-75 fs-5' style={{ fontWeight: 800, marginTop: "-20px" }}>
                                        {`${new Date(day.date).getDate()} ${months[new Date(day.date).getMonth()]}`}
                                    </p>
                                </button>
                            </div>
                        ))}
                </Slider>
                {selectedDay && value && studioBookings && (
                    <Table striped bordered hover className="table-container">
                        <tbody>
                            {Array.from({ length: 15 }, (_, i) => {
                                const hour = i + 10;
                                const timeSlot = `${String(hour).padStart(2, '0')}:00`;
                                const slot = `${selectedDay}T${timeSlot}`;
                                const booking = studioBookings.find(pren => {
                                    const prenStart = pren.inizio.toDate().getHours();
                                    const prenEnd = pren.fine.toDate().getHours();
                                    return prenStart <= hour && prenEnd > hour;
                                });
                                return (
                                    <tr key={timeSlot}>
                                        <td style={{ width: '80px', textAlign: 'right', paddingRight: '10px', verticalAlign: 'middle' }}>
                                            {timeSlot}
                                        </td>
                                        <td style={{ backgroundColor: selectedSlots.includes(slot) ? '#f0ad4e' : 'transparent', }} onClick={blockMode ? () => handleSlotClick(selectedDay, hour) : null}>
                                            {booking ? (
                                                <div style={{ backgroundColor: '#08B1DF', color: 'white', padding: '10px', borderRadius: '5px' }}>
                                                    <b style={{ fontWeight: 900 }}>{booking.nomeUtente}</b>
                                                </div>
                                            ) : (
                                                <div

                                                    style={{

                                                        cursor: blockMode ? 'pointer' : 'default',
                                                        color: "transparent"
                                                    }}
                                                >
                                                    {timeSlot}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                )}
            </div>
        );
    };


    const renderWeekly = () => {
        return (
            <div className="w-100 d-flex flex-column custom-slider-container overflow-scroll">
                <Table striped bordered hover className="table-container">
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>Orario</th>
                            {currentWeek.map(day => (
                                <th key={day.date} style={{ textAlign: 'center', backgroundColor: day.date === selectedDay ? '#08B1DF' : 'white', color: day.date === selectedDay ? 'white' : 'black' }}>
                                    {day.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 15 }, (_, i) => {
                            const hour = i + 10;
                            const timeSlot = `${String(hour).padStart(2, '0')}:00`;
                            return (
                                <tr key={timeSlot} style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}>
                                    <td style={{ width: '80px', textAlign: 'right', paddingRight: '10px', verticalAlign: 'middle', backgroundColor: "white" }}>
                                        {timeSlot}
                                    </td>
                                    {currentWeek.map(day => {
                                        const slot = `${day.date}T${timeSlot}`;
                                        const bookings = prenotazioni.filter(pren => {
                                            const prenDate = pren.inizio.toDate();
                                            return pren.studio === value &&
                                                getFormattedDate(prenDate) === day.date &&
                                                prenDate.getHours() === hour;
                                        });
                                        return (
                                            <td key={day.date} style={{ height: '60px', textAlign: 'center', backgroundColor: selectedSlots.includes(slot) ? '#f0ad4e' : 'white' }} onClick={blockMode ? () => handleSlotClick(day.date, hour) : null}>
                                                {bookings.length ? (
                                                    bookings.map(booking => (
                                                        <div key={booking.id} style={{ backgroundColor: '#08B1DF', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '5px' }} onClick={() => handleShowModal(booking)}>
                                                            <b style={{ fontWeight: 900, marginLeft: "10px" }} >{booking.nomeUtente}</b>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div

                                                        style={{
                                                            color: "transparent",
                                                            cursor: blockMode ? 'pointer' : 'default'
                                                        }}
                                                    >
                                                        {timeSlot}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        );
    };


    const handleWeekChange = (direction) => {
        const newWeek = currentWeek.map(day => {
            const date = new Date(day.date);
            date.setDate(date.getDate() + direction * 7);
            return {
                label: `${giorniSettimana[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`,
                date: getFormattedDate(date),
            };
        });
        setCurrentWeek(newWeek);
    };

    return (
        <div>
            <Box className="d-flex flex-row align-items-center justify-content-between" sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}>
                <Tabs onChange={handleChange} aria-label="basic tabs example">
                    <Tab className='studiointernalbbutt' label="Studio1" style={{ background: value === 1 ? "black" : "white", color: value === 1 ? "white" : "black", border: "1px solid black" }} />
                    <Tab label="Studio2" style={{ background: value === 2 ? "black" : "white", color: value === 2 ? "white" : "black", border: "1px solid black" }} />
                    <Tab label="Studio3" style={{ background: value === 3 ? "black" : "white", color: value === 3 ? "white" : "black", border: "1px solid black" }} />
                </Tabs>
                <div className='d-flex flex-row align-items-center justify-content-center' style={{ gap: "20px" }}>
                    <MuiButton variant="contained" color="primary" onClick={toggleBlockMode} style={{ marginLeft: '20px' }}>
                        {blockMode ? 'Annulla' : 'Blocca'}
                    </MuiButton>
                    {blockMode && selectedSlots.length > 0 && (
                        <MuiButton variant="contained" color="secondary" onClick={handleNext} style={{}}>
                            Avanti
                        </MuiButton>
                    )}
                </div>
            </Box>
            <div style={{ marginBottom: '20px', display: "flex", flexDirection: "row", alignItems: "center", justifyContent: view == "weekly" ? "space-between" : "center", width: "100%" }}>
                {view === 'weekly' && (
                    <p onClick={() => handleWeekChange(-1)} style={{ padding: "0px", borderBottom: "2px solid black" }}>Settimana Precedente</p>

                )}
                <FormControl variant="outlined">
                    <InputLabel>Vista</InputLabel>
                    <Select
                        value={view}
                        onChange={(e) => setView(e.target.value)}
                        label="Vista"
                    >
                        <MenuItem value="daily">Giornaliero</MenuItem>
                        <MenuItem value="weekly">Settimanale</MenuItem>
                    </Select>
                </FormControl>
                {view === 'weekly' && (

                    <p onClick={() => handleWeekChange(1)} style={{ padding: "0px", borderBottom: "2px solid black" }}>Settimana Successiva</p>
                )}
            </div>
            {view === 'daily' ? renderDays() : renderWeekly()}


            {selectedPrenotazione && (
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {showDeleteConfirmation ? 'Conferma Eliminazione' : 'Seleziona Servizi'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {showDeleteConfirmation ? (
                        <div>
                            <p>Sei sicuro di voler eliminare?</p>
                            <Button variant="danger" onClick={handleConfirmDelete}>Sì, elimina</Button>
                            <Button variant="secondary" onClick={handleCancelDelete}>No, torna indietro</Button>
                        </div>
                    ) : (
                        <Form>
                            <Form.Group controlId="formServices">
                                <Form.Label>Servizi</Form.Label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {['prod', 'Rec', 'Mix&Master'].map(service => (
                                        <Form.Check
                                            key={service}
                                            type="checkbox"
                                            label={service}
                                            value={service}
                                            checked={services.includes(service)}
                                            disabled={!isEditing}
                                            onChange={handleServiceChange}
                                        />
                                    ))}
                                </div>
                            </Form.Group>
                            <Form.Group controlId="formUsername">
                                <Form.Label>Nome Utente</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nome Utente"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </Form.Group>
                            <Form.Group controlId="formPhoneNumber">
                                <Form.Label>Numero di Telefono</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Numero di Telefono"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </Form.Group>
                            {/* Aggiungi ulteriori campi se necessario */}
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {showDeleteConfirmation ? (
                        <>
                            <Button variant="secondary" onClick={handleCancelDelete}>Annulla</Button>
                        </>
                    ) : (
                        <>
                            {!isEditing ? (
                                <>
                                    <Button variant="secondary" onClick={handleEdit}>Modifica</Button>
                                    <Button variant="danger" onClick={handleDelete}>Elimina</Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="secondary" onClick={() => setIsEditing(false)}>Annulla</Button>
                                    <Button variant="primary" onClick={handleSaveChanges}>Salva</Button>
                                </>
                            )}
                            <Button variant="secondary" onClick={handleServiceModalClose}>Chiudi</Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            )}

            <Modal show={serviceModalShow} onHide={handleServiceModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Seleziona Servizi</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Form>
                        <Form.Group controlId="formServices">
                            <Form.Label>Servizi</Form.Label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Form.Check
                                    type="checkbox"
                                    label="Production"
                                    value="prod"
                                    checked={services.includes('prod')}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setServices(prevServices =>
                                            e.target.checked ? [...prevServices, value] : prevServices.filter(service => service !== value)
                                        );
                                    }}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Recording"
                                    value="Rec"
                                    checked={services.includes('Rec')}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setServices(prevServices =>
                                            e.target.checked ? [...prevServices, value] : prevServices.filter(service => service !== value)
                                        );
                                    }}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Mix & Master"
                                    value="Mix&Master"
                                    checked={services.includes('Mix&Master')}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setServices(prevServices =>
                                            e.target.checked ? [...prevServices, value] : prevServices.filter(service => service !== value)
                                        );
                                    }}
                                />
                            </div>
                        </Form.Group>
                        <Form.Group controlId="formUsername">
                            <Form.Label>Nome Utente</Form.Label>
                            <Form.Control type="text" placeholder="Nome Utente" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="formPhoneNumber">
                            <Form.Label>Numero di Telefono</Form.Label>
                            <Form.Control type="text" placeholder="Numero di Telefono" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                        </Form.Group>
                        <select onChange={(e) => handleFonicoSelection(e.target.value)}>
                            {
                                fonici.map((fonico) => (
                                    <option key={fonico.id} value={fonico.id}>
                                        {fonico.nome}
                                    </option>
                                ))
                            }
                        </select>
                        <Form.Group controlId="formRepeat" style={{ marginTop: '20px' }}>
                            <Form.Check
                                type="checkbox"
                                label="Inserisci periodico"
                                checked={repeat !== null}
                                onChange={(e) => setRepeat(e.target.checked ? 1 : null)}
                            />
                            {repeat !== null && (
                                <Form.Control
                                    type="number"
                                    placeholder="Numero di settimane"
                                    value={repeat}
                                    onChange={(e) => setRepeat(e.target.value)}
                                    min="1"
                                    style={{ marginTop: '10px' }}
                                />
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleServiceModalClose}>Chiudi</Button>
                    <Button variant="primary" onClick={handleInsert} disabled={selectedFonico == 0}>Inserisci</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Calendar;
