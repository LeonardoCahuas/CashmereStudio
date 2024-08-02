import React, { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Box, MenuItem, Select, FormControl, InputLabel, Button as MuiButton } from '@mui/material';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import usePrenotazioni from '../../booking/useBooking';

import { Table, Button, Modal, Form } from 'react-bootstrap';

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0') + ':00');

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


const formatDateForInput = (date) => {
    // Assumiamo che date sia un oggetto Date
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
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
    const [adding, setAdding] = useState(false)
    const [newPrenStart, setNewPrenStart] = useState(
        { day: "", time: "" }
,    )
    const [newPrenotazione, setNewPrenotazione] = useState({
        nomeUtente: "",
        inizio: "",
        fine: "",
        telefono: "",
        studio: 0,
        stato: 2,
        services: []
    })



    const { prenotazioni, addPrenotazione, fonici, modificaPrenotazione, eliminaPrenotazione } = usePrenotazioni(selectedDay);
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
        setNewPrenotazione(prev => ({
            ...prev,
            studio: newValue + 1
        }));
    };

    const handleInputChange = (field, value) => {
        setSelectedPrenotazione(prevState => ({
            ...prevState,
            [field]: value
        }));


        console.log(selectedPrenotazione)
    };


    const handleShowModal = (prenotazione) => {
        console.log(prenotazione)
        setSelectedPrenotazione(prenotazione);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedPrenotazione(null);
        setShowModal(false);
        setIsEditing(false)
        setShowDeleteConfirmation(false)
    };

    const handleServiceModalClose = () => setShowModal(false);

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
        handleCloseModal();
        eliminaPrenotazione(selectedPrenotazione.id)
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false);
    };

    const handleHourChange = (event) => {
        const value = event.target.value;
        setNewPrenotazione(prev => ({
            ...prev,
            fine: value
        }));
    };


    const handleFonicoSelection = (fonico) => {
        console.log(fonico)
        setSelectedFonico(fonico)
    }

    const handleFonicoSelectionAdd = (fonico) => {
        console.log(fonico)
        setNewPrenotazione(prev => ({
            ...prev,
            fonico: fonico
        }));
    }

    const handleSlotClick = (date, hour) => {
        const slot = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00`);
        if (selectedSlots.some(s => s.getTime() === slot.getTime())) {
            setSelectedSlots(selectedSlots.filter(s => s.getTime() !== slot.getTime()));
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
        console.log(selectedPrenotazione)
        modificaPrenotazione(selectedPrenotazione.id, selectedPrenotazione)
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleServiceChange = (service, checked) => {
        setSelectedPrenotazione(prevState => ({
            ...prevState,
            services: checked
                ? [...prevState.services, service]
                : prevState.services.filter(s => s !== service)
        }));
    };


    const addBook = (day, start) => {
        console.log("adding pren")
        console.log(day)
        console.log(start)
        setNewPrenStart(
            {
                day: day,
                time: start
            }
        )
        setAdding(true)
    }

    const handleNewInputChange = (field, value) => {
        setNewPrenotazione(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    const handleNewServiceChange = (service, isChecked) => {
        setNewPrenotazione(prevState => {
            const updatedServices = isChecked
                ? [...prevState.services, service]
                : prevState.services.filter(s => s !== service);

            return {
                ...prevState,
                services: updatedServices
            };
        });
    };


    const handleSaveNewPrenotazione = () => {
        try {
            let startDate;
            if (newPrenStart.day && typeof newPrenStart.day === 'object' && newPrenStart.day.date) {
                const dateStr = newPrenStart.day.date;
                const dateParts = dateStr.split('-');
                if (dateParts.length === 3 && dateParts[0].length === 4 && dateParts[1].length === 2 && dateParts[2].length === 2) {
                    const year = parseInt(dateParts[0], 10);
                    const month = parseInt(dateParts[1], 10) - 1;
                    const day = parseInt(dateParts[2], 10);
                    startDate = new Date(year, month, day);
                } else {
                    throw new Error('Invalid start day format');
                }
            } else {
                throw new Error('Invalid start day object or property missing');
            }

            if (isNaN(startDate.getTime())) {
                throw new Error('Invalid start date');
            }

            const [startHour, startMinute] = (newPrenStart.time || '00:00').split(':').map(Number);
            if (isNaN(startHour) || isNaN(startMinute)) {
                throw new Error('Invalid start time format');
            }
            startDate.setHours(startHour, startMinute);

            const [endHour, endMinute] = (newPrenotazione.fine || '00:00').split(':').map(Number);
            if (isNaN(endHour) || isNaN(endMinute)) {
                throw new Error('Invalid end time format');
            }
            const endDate = new Date(startDate);
            endDate.setHours(endHour, endMinute);

            for (let i = 0; i < (repeat || 1); i++) {
                const newInizio = new Date(startDate);
                const newFine = new Date(endDate);
                newInizio.setDate(startDate.getDate() + i * 7);
                newFine.setDate(endDate.getDate() + i * 7);

                const newPrenotazioneWithTimestamps = {
                    ...newPrenotazione,
                    inizio: newInizio,
                    fine: newFine,
                };

                console.log('Prenotazione salvata:', newPrenotazioneWithTimestamps);

                addPrenotazione(newPrenotazioneWithTimestamps);
            }

            setNewPrenotazione({
                nomeUtente: "",
                inizio: "",
                fine: "",
                telefono: "",
                studio: 0,
                stato: 2,
                services: []
            });

            setAdding(false);
            handleServiceModalClose();

        } catch (error) {
            console.error('Error saving new reservation:', error);
        }
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
                                                <div style={{ cursor: blockMode ? 'pointer' : 'default', color: "transparent" }}>
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
                                            const prenStart = prenDate.getHours();
                                            const prenEnd = pren.fine.toDate().getHours();
                                            return pren.studio === value &&
                                                getFormattedDate(prenDate) === day.date &&
                                                prenStart <= hour && prenEnd > hour
                                        });
                                        return (
                                            <td key={day.date} style={{ height: '60px', textAlign: 'center', backgroundColor: selectedSlots.includes(slot) ? '#f0ad4e' : 'white' }}>
                                                {bookings.length ? (
                                                    bookings.map(booking => (
                                                        <div key={booking.id} style={{ backgroundColor: '#08B1DF', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '5px' }} onClick={() => blockMode ? null : handleShowModal(booking)}>
                                                            <b style={{ fontWeight: 900, marginLeft: "10px" }} >{booking.nomeUtente}</b>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{ color: "transparent", cursor: blockMode ? 'pointer' : 'default' }} onClick={() => blockMode ? handleSlotClick(new Date(`${day.date}T${String(hour).padStart(2, '0')}:00:00`).getTime()) : addBook(day, timeSlot)}>
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
                    <Tab className='studiointernalbbutt' label="Studio 1" style={{ background: value === 1 ? "black" : "white", color: value === 1 ? "white" : "black", border: "1px solid black" }} />
                    <Tab label="Studio 2" style={{ background: value === 2 ? "black" : "white", color: value === 2 ? "white" : "black", border: "1px solid black" }} />
                    <Tab label="Studio 3" style={{ background: value === 3 ? "black" : "white", color: value === 3 ? "white" : "black", border: "1px solid black" }} />
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
                            <div>
                                {isEditing ? (
                                    <div>
                                        <Form.Group controlId="formId">
                                            <Form.Label>ID</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={selectedPrenotazione.id}
                                                disabled
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="formNomeUtente">
                                            <Form.Label>Nome Utente</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={selectedPrenotazione.nomeUtente}
                                                onChange={(e) => handleInputChange('nomeUtente', e.target.value)}
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="formTelefono">
                                            <Form.Label>Telefono</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={selectedPrenotazione.telefono}
                                                onChange={(e) => handleInputChange('telefono', e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="formServizi">
                                            <Form.Label>Servizi</Form.Label>
                                            {['Production', 'Rec', 'MixAndMaster'].map(service => (
                                                <Form.Check
                                                    key={service}
                                                    type="checkbox"
                                                    label={service}
                                                    value={service}
                                                    checked={selectedPrenotazione.services.includes(service)}
                                                    onChange={(e) => handleServiceChange(service, e.target.checked)}
                                                />
                                            ))}
                                        </Form.Group>
                                        <Form.Group controlId="formInizio">
                                            <Form.Label>Inizio</Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                value={formatDateForInput(selectedPrenotazione.inizio.toDate())}
                                                onChange={(e) => handleInputChange('inizio', parseISO(e.target.value))}
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="formFine">
                                            <Form.Label>Fine</Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                value={formatDateForInput(selectedPrenotazione.fine.toDate())}
                                                onChange={(e) => handleInputChange('fine', parseISO(e.target.value))}
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="formStudio">
                                            <Form.Label>Studio</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={selectedPrenotazione.studio}
                                                onChange={(e) => handleInputChange('studio', e.target.value)}
                                            />
                                        </Form.Group>

                                    </div>
                                ) : (
                                    <div>
                                        <p>ID: {selectedPrenotazione.id}</p>
                                        <p>Nome Utente: {selectedPrenotazione.nomeUtente}</p>
                                        <p>Telefono: {selectedPrenotazione.telefono}</p>
                                        <div className='d-flex flex-row align-items-center justify-content-start mb-3'>Servizi: <p className='text-white'>...</p> {selectedPrenotazione.services && selectedPrenotazione.services.map((servi) => <p key={servi} className="m-0">{servi}, {" "}</p>)}</div>
                                        <p>Inizio: {selectedPrenotazione.inizio.toDate().toLocaleString()}</p>
                                        <p>Fine: {selectedPrenotazione.fine.toDate().toLocaleString()}</p>
                                        <p>Studio: {selectedPrenotazione.studio}</p>
                                        <p>Stato: {selectedPrenotazione.stato}</p>
                                    </div>
                                )}
                            </div>
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

            {adding && (
                <Modal show={adding} onHide={() => setAdding(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Aggiungi Prenotazione</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formNomeUtente">
                                <Form.Label>Nome Utente</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nome Utente"
                                    value={newPrenotazione.nomeUtente}
                                    onChange={(e) => handleNewInputChange('nomeUtente', e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group controlId="formTelefono">
                                <Form.Label>Telefono</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Numero di Telefono"
                                    value={newPrenotazione.telefono}
                                    onChange={(e) => handleNewInputChange('telefono', e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group controlId="formServizi">
                                <Form.Label>Servizi</Form.Label>
                                {['Produzione', 'Rec', 'MixAndMaster'].map(service => (
                                    <Form.Check
                                        key={service}
                                        type="checkbox"
                                        label={service}
                                        checked={newPrenotazione.services.includes(service)}
                                        onChange={(e) => handleNewServiceChange(service, e.target.checked)}
                                    />
                                ))}
                            </Form.Group>

                            <Form.Group controlId="formHour">
                                <Form.Label>Fine</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={newPrenotazione.fine}
                                    onChange={(e) => handleHourChange(e)}
                                >
                                    {hours.map(hour => (
                                        <option key={hour} value={hour}>
                                            {hour}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId="formStudio">
                                <Form.Label>Studio</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={newPrenotazione.studio}
                                    onChange={(e) => handleNewInputChange('studio', e.target.value)}
                                >
                                    {[1, 2, 3].map(studio => (
                                        <option key={studio} value={studio}>
                                            {studio}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            <select onChange={(e) => handleFonicoSelectionAdd(e.target.value)}>
                                {
                                    fonici.map((fonico) => (
                                        <option key={fonico.id} value={fonico.id}>
                                            {fonico.nome}
                                        </option>
                                    ))
                                }
                            </select>

                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setAdding(false)}>
                            Annulla
                        </Button>
                        <Button variant="primary" onClick={handleSaveNewPrenotazione}>
                            Salva Prenotazione
                        </Button>
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
