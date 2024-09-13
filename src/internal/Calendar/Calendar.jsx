import React, { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Box, MenuItem, Select, FormControl, InputLabel, Button as MuiButton } from '@mui/material';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import usePrenotazioni from '../../booking/useBooking';
import { v4 as uuidv4 } from 'uuid';

import { Table, Button, Modal, Form } from 'react-bootstrap';

const hours = Array.from({ length: 18 }, (_, i) => { // Cambiato da 13 a 18 per includere le ore fino alle 4
    const hour = (i + 10) % 24; // Calcola l'ora in formato 24 ore
    return String(hour).padStart(2, '0') + ':00';
});

const months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const giorniSettimana = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

const formatDateForInput = (date) => {
    // Assumiamo che date sia un oggetto Date
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
};

function formatDate(dateString) {
    const weekdays = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const date = new Date(dateString);

    // Ottieni il giorno della settimana e il giorno del mese
    const weekdayName = weekdays[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1; // I mesi in JavaScript sono indicizzati da 0

    // Formatta il giorno e il mese con uno zero iniziale se necessario
    const formattedDay = day.toString().padStart(2, '0');
    const formattedMonth = month.toString().padStart(2, '0');

    return {
        label: `${weekdayName} ${formattedDay}/${formattedMonth}`,
        date: dateString
    };
}

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
    const [availableStartTimes, setAvailableStartTimes] = useState([]); // Ore di inizio disponibili
    const [availableEndTimes, setAvailableEndTimes] = useState([]);     // Ore di fine disponibili
    const [availableStudios, setAvailableStudios] = useState([]);       // Studi disponibili
    const [studioPren, setStudioPren] = useState(1)
    const [selectedFonico, setSelectedFonico] = useState(0)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [adding, setAdding] = useState(false)
    const [inizio, setInizio] = useState()
    const [fine, setFine] = useState()
    const [endHoursOptions, setEndHoursOptions] = useState(hours)
    const [newPrenStart, setNewPrenStart] = useState(
        { day: "", time: "" }
        ,)
    const [newPrenotazione, setNewPrenotazione] = useState({
        nomeUtente: "",
        inizio: "",
        fine: "",
        telefono: "",
        studio: 0,
        stato: 2,
        services: [],
        prenotatoDa: "",
        note: ""
    })
    const [fonicoColors, setFonicoColors] = useState({});
    const [isPeriod, setIsPeriod] = useState(false)

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
                <i className="fa-solid fa-chevron-left" style={{ color: "black", fontSize: "40px", backgroundColor: "white", width: "40px", height: "40px", borderRadius: '50%', position: "absolute", top: "-0px", left: "-2.5px" }}></i>
            </div>
        );
    };

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 0.5,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        className: 'custom-slider',
        rows: 1
    };


    const findFonico = (id) => {
        const fonico = fonici.find((fon) => fon.id == id)
        return fonico && fonico.nome ? fonico.nome : ""
    }

    const { prenotazioni, addPrenotazione, fonici, modificaPrenotazione, eliminaPrenotazione, handleDeleteAllPeriodPren } = usePrenotazioni(selectedDay);
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const colors = [
            '#81d152', // Verde
            '#ff5347', // Rosso
            '#1034a6', // Blu
            '#ff9d4f', // Arancione
            '#5b4db7', // Viola
            '#73c2fb', // Ciano
            '#ff8c94', // Rosa
            '#d7be9', // Oro
            '#bcd97c', // Verde lime
        ];


        let assignedColors = fonici.reduce((acc, fonico, index) => {
            acc[fonico.id] = colors[index % colors.length]; // Assegna un colore a ogni fonico usando l'ID
            return acc;
        }, {});

        assignedColors["LlFzgMM8KNJoR18KvXpU"] = "#bcb8b6"
        assignedColors["nope"] = "#bcb8b6"
        assignedColors["1"] = "#bcb8b6"
        assignedColors["i4x1IcxsgGLUHZpfz7p7"] = "#111e6c"

        setFonicoColors(assignedColors);
    }, [fonici]);

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
        setStudioPren(newValue + 1)
    };

    const handleInputChange = (field, value) => {
        setSelectedPrenotazione(prevState => ({
            ...prevState,
            [field]: value
        }));

        if (field == 'inizio') {
            setInizio(value)
        } else if (field == 'fine') {
            setFine(value)
        }
    };

    useEffect(() => {
        if (selectedPrenotazione && selectedPrenotazione.inizio && selectedPrenotazione.fine) {
            setInizio(formatDateForInput(selectedPrenotazione.inizio.toDate()))
            setFine(formatDateForInput(selectedPrenotazione.fine.toDate()))
        }
    }, [selectedPrenotazione])


    const handleShowModal = (prenotazione) => {
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
        setIsPeriod(!blockMode)
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
        setSelectedFonico(fonico)
    }

    const handleFonicoSelectionAdd = (fonico) => {
        setNewPrenotazione(prev => ({
            ...prev,
            fonico: fonico
        }));
    }

    const handleFonicoSelectionEdit = (fonico) => {
        setSelectedPrenotazione(prev => ({
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
        const uid = uuidv4();
        const mergedSlots = []; // Array per memorizzare le prenotazioni unite
        let currentSlot = null;
    
        selectedSlots.sort((a, b) => a - b); // Ordina gli slot per data
    
        selectedSlots.forEach(slot => {
            if (slot instanceof Date) {
                const inizio = new Date(slot);
                const fine = new Date(inizio);
                fine.setHours(inizio.getHours() + 1);
    
                // Se non ci sono slot correnti, inizializza
                if (!currentSlot) {
                    currentSlot = { inizio, fine };
                } else {
                    // Controlla se il nuovo slot è contiguo al corrente
                    const lastFine = new Date(currentSlot.fine);
                    lastFine.setHours(lastFine.getHours() + 1); // Aggiungi un'ora per il confronto
    
                    if (inizio.getTime() === lastFine.getTime()) {
                        // Unisci i slot
                        currentSlot.fine = fine; // Aggiorna la fine
                    } else {
                        // Aggiungi il slot corrente all'array e inizia un nuovo slot
                        mergedSlots.push(currentSlot);
                        currentSlot = { inizio, fine };
                    }
                }
            } else {
                console.error('Invalid slot format:', slot);
            }
        });
    
        // Aggiungi l'ultimo slot se esiste
        if (currentSlot) {
            mergedSlots.push(currentSlot);
        }
    
        // Inserisci le prenotazioni
        mergedSlots.forEach(({ inizio, fine }) => {
            addPrenotazione({
                nomeUtente: username || 'Blocco',
                studio: value,
                telefono: phoneNumber || 'Blocco',
                services,
                inizio,
                fine,
                stato: 2,
                fonico: selectedFonico,
                note: "",
                prenotatoDa: "gestionale",
                period: uid
            });
        });
    
        // Reset dello stato
        setServiceModalShow(false);
        setSelectedSlots([]);
        handleServiceModalClose();
        setBlockMode(false);
        setUsername("");
        setSelectedFonico("");
        setPhoneNumber("");
    };


    const handleSaveChanges = () => {
        setIsEditing(false);
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
        console.log(day)
        console.log(start)
        const startHour = parseInt(start.split(':')[0]);

        // Trova le prenotazioni del giorno specifico e dello studio selezionato
        const bookingsForTheDay = prenotazioni
            .filter(pren => getFormattedDate(pren.inizio.toDate()) === day.date && pren.studio === value && pren.stato == 2)
            .map(pren => ({
                startHour: pren.inizio.toDate().getHours(),
                endHour: pren.fine.toDate().getHours()
            }))
            .sort((a, b) => a.startHour - b.startHour);

        // Trova la prossima prenotazione dopo l'ora di inizio selezionata
        const nextBooking = bookingsForTheDay.find(booking => booking.startHour > startHour);

        // Calcola le opzioni di orario di fine
        let endHourOptions;
        if (nextBooking) {
            endHourOptions = Array.from({ length: nextBooking.startHour - startHour }, (_, i) => startHour + i + 1);
        } else {
            endHourOptions = Array.from({ length: 22 - startHour + 6 }, (_, i) => (startHour + i + 1) % 24);
        }

        // Imposta le opzioni per l'orario di fine
        setEndHoursOptions(endHourOptions);
        const endHour = startHour + 1;
        setNewPrenStart({
            day: day,
            time: start
        });
        setNewPrenotazione((prev) => ({
            ...prev,
            studio: value,
            fine: endHour
        }))
        setAdding(true);
    };


    const handleNewInputChange = (field, stu) => {
        console.log(typeof value)
        console.log(typeof stu)
        if (field == "studio") {
            console.log("cambiando studio")
            setNewPrenotazione(prevState => ({
                ...prevState,
                [field]: field == 'studio' && stu == 1 ? 1 : field == 'studio' && stu == 2 ? 2 : field == 'studio' && stu == 3 ? 3 : 0
            }));
            setStudioPren(stu)
        } else {
            setNewPrenotazione(prevState => ({
                ...prevState,
                [field]: stu
            }))
        }
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

    useEffect(() => {
        if (adding == false) {
            setNewPrenotazione({
                nomeUtente: "",
                inizio: "",
                fine: "",
                telefono: "",
                studio: 0,
                stato: 2,
                services: []
            });
        }
    }, [adding])


    const handleSaveNewPrenotazione = () => {
        console.log(newPrenotazione.fine)
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
            console.log(newPrenotazione)
            const [startHour, startMinute] = (newPrenStart.time || '00:00').split(':').map(Number);
            if (isNaN(startHour) || isNaN(startMinute)) {
                throw new Error('Invalid start time format');
            }
            startDate.setHours(startHour, startMinute);
            console.log(newPrenotazione.fine)
            const endHour = newPrenotazione.fine
            if (isNaN(endHour)) {
                throw new Error('Invalid end time format');
            }
            const endDate = new Date(startDate);
            endDate.setHours(endHour, "00");

            for (let i = 0; i < (repeat || 1); i++) {
                const newInizio = new Date(startDate);
                const newFine = new Date(endDate);
                newInizio.setDate(startDate.getDate() + i * 7);
                newFine.setDate(endDate.getDate() + i * 7);

                const newPrenotazioneWithTimestamps = {
                    ...newPrenotazione,
                    inizio: newInizio,
                    fine: newFine,
                    studio: studioPren,
                    prenotatoDa: "gestionale"
                };
                console.log(newPrenotazioneWithTimestamps)
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
            handleServiceModalClose()

        } catch (error) {
            console.error('Error saving new reservation:', error);
        }
    };

    const handleDeleteAllPeriod = () => {
        setShowDeleteConfirmation(false);
        const prenToDel = prenotazioni.filter(p => p.period && p.period == selectedPrenotazione.period)
        handleDeleteAllPeriodPren(selectedPrenotazione.period)
        handleCloseModal();
    }

    useEffect(() => {
        if (selectedDay) {
            let newPren = prenotazioni.filter((pren) => pren.studio === value);
            setStudioBookings(newPren);
        } else {
            setStudioBookings([]);
        }
    }, [prenotazioni, value, selectedDay]);

    const renderDays = () => {
        const bookingsByDay = getMonthDays().reduce((acc, day) => {
            if (day) {
                acc[day.date] = prenotazioni
                    .filter(pren => {
                        try {
                            const prenDate = pren.inizio.toDate();
                            return pren.studio === value &&
                                getFormattedDate(prenDate) === day.date && pren.stato == 2
                        } catch (err) {
                            console.log(err.message);
                            return false;
                        }
                    })
                    .map(pren => {
                        const startHour = pren.inizio.toDate().getHours();
                        const endHour = pren.fine.toDate().getHours();
                        return {
                            ...pren,
                            startHour,
                            endHour
                        };
                    });
            }
            return acc;
        }, {});

        const occupiedSlots = {};

        return (
            <div className="w-100 d-flex flex-column custom-slider-container">
                <Slider {...settings} className="week-slider custom-slider w-100" style={{ height: '150px', padding: '30px' }}>
                    {getMonthDays()
                        .filter((day) => day)
                        .map((day, index) => (
                            <div key={index} className="day-slide" style={{ width: '200px', backgroundColor: "transparent" }}>
                                <button
                                    className={`day-button ${day.date === selectedDay ? 'selected' : ''} d-flex flex-column justify-content-center align-items-start`}
                                    onClick={() => setSelectedDay(day.date)}
                                    style={{ width: '160px', backgroundColor: "white", border: day.date === selectedDay ? "2px solid #08B1DF" : "2px solid black", color: day.date === selectedDay ? "white" : "black", textAlign: "start", height: "fit-content" }}
                                >
                                    <p className='text-start w-75 fs-6 m-0 text-start'>
                                        {`${giorniSettimana[new Date(day.date).getDay()]}`}
                                    </p>
                                    <p className='text-start w-75 fs-6 m-0' style={{ fontWeight: 800, marginTop: "-20px", whiteSpace: 'nowrap' }}>
                                        {`${new Date(day.date).getDate()} ${months[new Date(day.date).getMonth()]}`}
                                    </p>
                                </button>
                            </div>
                        ))}
                </Slider>
                {selectedDay && value && bookingsByDay[selectedDay] && (
                    <Table striped bordered hover className="table-container" style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
                        <thead>
                            <tr>
                                <th style={{ width: '80px', border: "1px solid black" }}>Orario</th>
                                <th>Dettagli</th>
                            </tr>
                        </thead>
                        <tbody style={{ overflow: "hidden" }}>
                            {Array.from({ length: 19 }, (_, i) => { // Cambiato da 13 a 18 per includere le ore fino alle 4
                                const hour = (i + 10) % 24; // Calcola l'ora in formato 24 ore
                                const timeSlot = `${String(hour).padStart(2, '0')}:00`;
                                const isNextDay = hour < 10; // Controlla se è un'ora del giorno successivo

                                if (occupiedSlots[`${selectedDay}-${hour}`]) {
                                    return (
                                        <tr key={timeSlot}>
                                            <td style={{ width: '80px', textAlign: 'right', paddingRight: '10px', verticalAlign: 'middle', backgroundColor: "white" }}>
                                                {timeSlot}
                                            </td>
                                        </tr>
                                    );
                                }

                                const bookings = bookingsByDay[selectedDay] || [];
                                const currentBookings = bookings.filter(b => {
                                    const startHour = b.startHour % 24; // Gestisci l'ora in formato 24 ore
                                    const endHour = b.endHour % 24; // Gestisci l'ora in formato 24 ore
                                    return (startHour <= hour && endHour > hour) || (isNextDay && startHour < 10 && endHour >= 24);
                                });

                                let cellContent = null;
                                let rowSpan = 1;

                                if (currentBookings.length > 0) {
                                    const booking = currentBookings[0];
                                    rowSpan = booking.endHour - booking.startHour;

                                    // Segna gli slot come occupati
                                    for (let r = 0; r < rowSpan; r++) {
                                        occupiedSlots[`${selectedDay}-${(hour + r) % 24}`] = true; // Gestisci l'ora in formato 24 ore
                                    }

                                    const fonico = booking.fonico ? booking.fonico : "nope";

                                    cellContent = (
                                        <div style={{
                                            backgroundColor: fonicoColors[fonico] || "grey",
                                            color: 'white',
                                            padding: '10px',
                                            borderRadius: '5px',
                                            height: "100%",
                                            display: 'flex',
                                            flexDirection: "column",
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxSizing: 'border-box'
                                        }} onClick={() => handleShowModal(booking)}>
                                            <b style={{ fontWeight: 900, fontSize: isMobile ? "13.5px" : "15px" }}>{booking.nomeUtente}, {findFonico(fonico) !== "" ? findFonico(fonico) : "senza fonico"}</b>
                                            <b style={{ fontSize: isMobile ? "13.5px" : "15px" }}>{booking.inizio.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}-{booking.fine.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</b>
                                        </div>
                                    );
                                } else {
                                    cellContent = (
                                        <div style={{ color: "transparent", cursor: blockMode ? 'pointer' : 'default' }} onClick={() => blockMode ? handleSlotClick(selectedDay, hour) : addBook(formatDate(selectedDay), timeSlot)}>
                                            {timeSlot}
                                        </div>
                                    );
                                }

                                return (
                                    <tr key={timeSlot}>
                                        <td style={{ width: '80px', textAlign: 'right', paddingRight: '10px', verticalAlign: 'middle', backgroundColor: "white" }}>
                                            {timeSlot}
                                        </td>
                                        <td
                                            rowSpan={rowSpan}
                                            style={{
                                                backgroundColor: cellContent && currentBookings.length > 0 ? fonicoColors[currentBookings[0]?.fonico] || "#bcb8b6" : 'white',
                                                verticalAlign: 'middle',
                                                padding: '0',
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            {cellContent}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>

                    </Table>
                )}
            </div>
        )
    }

    const renderWeekly = () => {
        const bookingsByDay = currentWeek.reduce((acc, day) => {
            acc[day.date] = prenotazioni
                .filter(pren => {
                    try {
                        const prenDate = pren.inizio.toDate();
                        return pren.studio === value && pren.stato == 2 &&
                            getFormattedDate(prenDate) === day.date;
                    } catch (err) {
                        console.log(err.message);
                        return false;
                    }
                })
                .map(pren => {
                    if(pren.nomeUtente == "teduaa"){
                        console.log(pren)
                    }
                    const startHour = pren.inizio.toDate().getHours();
                    const endHour = pren.fine.toDate().getHours();
                    return {
                        ...pren,
                        startHour,
                        endHour
                    };
                });
            return acc;
        }, {});



        const occupiedSlots = {};

        const rows = [];
        for (let i = 0; i < 19; i++) {
            const hour = (i + 10) % 24;
            const timeSlot = `${String(hour).padStart(2, '0')}:00`;
            const isNextDay = hour < 10;

            const row = {
                timeSlot,
                cells: currentWeek.map((day, colIndex) => {
                    const bookings = bookingsByDay[day.date] || [];
                    const currentBookings = bookings.filter(b => {
                        const startHour = b.startHour % 24;
                        const endHour = b.endHour % 24;
                        return (startHour <= hour && endHour > hour) || (isNextDay && startHour < 10 && endHour >= 24);
                    });
                    let isContent = false;
                    let fonico = "nope";
                    let cellContent = null;
                    let rowSpan = 1;

                    if (currentBookings.length > 0) {
                        isContent = true;
                        const booking = currentBookings[0];
                        rowSpan = booking.endHour - booking.startHour;

                        // Controlla se lo slot è già occupato
                        if (occupiedSlots[`${day.date}-${hour}`]) {
                            return null;
                        }

                        // Segna gli slot come occupati
                        for (let r = 0; r < rowSpan; r++) {
                            occupiedSlots[`${day.date}-${(hour + r) % 24}`] = true; // Gestisci l'ora in formato 24 ore
                        }

                        fonico = booking.fonico ? booking.fonico : "nope";

                        cellContent = (
                            <div style={{
                                backgroundColor: 'transparent',
                                color: 'white',
                                borderRadius: '5px',
                                height: `100%`,
                                display: 'flex',
                                flexDirection: "column",
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxSizing: 'border-box'
                            }} onClick={() => blockMode ? null : handleShowModal(booking)}>
                                <b style={{ fontWeight: 900, fontSize: isMobile ? "13.5px" : "15px" }}>{booking.nomeUtente}, {findFonico(booking.fonico) !== "" ? findFonico(booking.fonico) : "senza fonico"}</b>
                                <b style={{ fontSize: isMobile ? "13.5px" : "15px" }}> {booking.inizio.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}-{booking.fine.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</b>
                            </div>
                        );
                    } else {
                        cellContent = (
                            <div style={{ color: "transparent", cursor: blockMode ? 'pointer' : 'default' }} onClick={() => blockMode ? handleSlotClick(day.date, hour) : addBook(day, timeSlot)}>
                                {timeSlot}
                            </div>
                        );
                    }

                    return {
                        content: cellContent,
                        rowSpan,
                        isContent,
                        fonico: fonico
                    };
                })
            };

            rows.push(row);
        }

        return (
            <div className="w-100 d-flex flex-column custom-slider-container overflow-scroll">
                <Table striped bordered hover className="table-container" >
                    <thead>
                        <tr>
                            <th style={{ width: '80px', border: "1px solid black", fontWeight: 900 }}>Orario</th>
                            {currentWeek.map(day => (
                                <th key={day.date} style={{ textAlign: 'center', backgroundColor: day.date === selectedDay ? '#08B1DF' : 'white', color: day.date === selectedDay ? 'white' : 'black', border: day.date === selectedDay ? "1px solid #08B1DF" : "1px solid black" }}>
                                    {day.label} {day.date === selectedDay ? "  (oggi)" : ""}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(({ timeSlot, cells }) => (
                            <tr key={timeSlot}>
                                <td style={{ width: '80px', textAlign: 'right', paddingRight: '10px', verticalAlign: 'middle', backgroundColor: "white", border: "1px solid black", fontWeight: "900" }}>
                                    {timeSlot}
                                </td>
                                {cells.map((cell, colIndex) => {
                                    if (!cell) return null; // Salta le celle già occupate

                                    const { content, rowSpan, isContent, fonico } = cell;

                                    return (
                                        <td
                                            key={currentWeek[colIndex].date}
                                            rowSpan={rowSpan}
                                            style={{
                                                textAlign: 'center',
                                                backgroundColor: isContent && fonicoColors[fonico] != undefined ? fonicoColors[fonico] : isContent && fonicoColors[fonico] == undefined ? "grey" : selectedSlots.some(s => s.getTime() === new Date(`${currentWeek[colIndex].date}T${timeSlot}`).getTime()) ? 'black' : 'white',
                                                verticalAlign: 'middle',
                                                padding: '0',
                                            }}
                                        >
                                            {content}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
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
                    <Tab className='studiointernalbbutt p-1' onClick={() => setBlockMode(false)} label="Studio 1" style={{ background: value === 1 ? "black" : "white", color: value === 1 ? "white" : "black", border: "1px solid black" }} />
                    <Tab label="Studio 2" className='p-1' onClick={() => setBlockMode(false)} style={{ background: value === 2 ? "black" : "white", color: value === 2 ? "white" : "black", border: "1px solid black" }} />
                    <Tab label="Studio 3" className='p-1' onClick={() => setBlockMode(false)} style={{ background: value === 3 ? "black" : "white", color: value === 3 ? "white" : "black", border: "1px solid black" }} />
                </Tabs>
                {view == "weekly" && <div className='d-flex flex-row align-items-center justify-content-center mb-2' style={{ gap: "20px" }}>
                    <MuiButton variant="contained" color="primary" onClick={toggleBlockMode} style={{ marginLeft: '20px', background: "transparent", border: "2px solid black", color: "black" }}>
                        {blockMode ? 'Annulla' : 'Blocca'}
                    </MuiButton>
                    {blockMode && selectedSlots.length > 0 && (
                        <MuiButton variant="contained" color="secondary" onClick={handleNext} style={{ background: "transparent", border: "2px solid black", color: "black" }}>
                            Avanti
                        </MuiButton>
                    )}
                </div>}
            </Box>
            <div style={{ marginBottom: '20px', display: "flex", flexDirection: "row", alignItems: "center", justifyContent: view == "weekly" ? "space-between" : "center", width: "100%" }}>
                {view === 'weekly' && (
                    <i onClick={() => handleWeekChange(-1)} className="fa-solid fa-arrow-left d-flex flex-column align-items-center justify-content-center" style={{ fontSize: "30px", borderRadius: "50%", border: "2px solid black", width: "40px", height: "40px" }}></i>

                )}
                <FormControl variant="outlined">
                    <Select
                        value={view}
                        onChange={(e) => {
                            setView(e.target.value);
                            setBlockMode(false);
                            if (e.target.value === "weekly") {
                                setSelectedDay(getFormattedDate(new Date()));
                            }
                        }}
                        onClick={(e) => e.stopPropagation()} // Aggiungi questo per gestire il click
                        style={{ paddingRight: "100px" }}
                        displayEmpty
                    >
                        <MenuItem value="daily">Giornaliero</MenuItem>
                        <MenuItem value="weekly">Settimanale</MenuItem>
                    </Select>
                </FormControl>
                {view === 'weekly' && (

                    <i onClick={() => handleWeekChange(1)} className="fa-solid fa-arrow-right  d-flex flex-column align-items-center justify-content-center" style={{ fontSize: "30px", borderRadius: "50%", border: "2px solid black", width: "40px", height: "40px" }}></i>
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
                                <Button variant="danger" style={{ background: "transparent", border: "2px solid red", color: "red", marginRight: "10px" }} onClick={handleConfirmDelete}>Sì, elimina</Button>
                                <Button variant="secondary" style={{ background: "transparent", border: "2px solid black", color: "black" }} onClick={handleCancelDelete}>No, torna indietro</Button>
                                {
                                    selectedPrenotazione.period &&
                                    <Button variant="primary" style={{ background: "transparent", border: "2px solid orange", color: "orange" }} onClick={handleDeleteAllPeriod}>Elimina tutte le periodiche</Button>
                                }
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
                                            {['Produzione', 'Rec', 'MixAndMaster'].map(service => (
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

                                        <label className='mt-3'>Cambia fonico:</label>
                                        <select className='m-3' onChange={(e) => handleFonicoSelectionEdit(e.target.value)}>
                                            {
                                                fonici.map((fonico) => (
                                                    <option key={fonico.id} value={fonico.id} selected={selectedPrenotazione.fonico == fonico.id}>
                                                        {fonico.nome}
                                                    </option>
                                                ))
                                            }
                                        </select>

                                        <Form.Group controlId="formNote">
                                            <Form.Label>Note</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={selectedPrenotazione.note ? selectedPrenotazione.note : ""}
                                                onChange={(e) => handleInputChange('note', e.target.value)}
                                            />
                                        </Form.Group>

                                    </div>
                                ) : (
                                    <div>
                                        <p>ID: {selectedPrenotazione.id}</p>
                                        <p>Nome Utente: {selectedPrenotazione.nomeUtente}</p>
                                        <p>Telefono: {selectedPrenotazione.telefono}</p>
                                        <div className='d-flex flex-row align-items-center justify-content-start mb-3'>Servizi: <p className='text-white'>...</p> {selectedPrenotazione.services && selectedPrenotazione.services.map((servi) => <p key={servi} className="m-0">{servi}, {" "}</p>)}</div>
                                        <p>
                                            Inizio: {selectedPrenotazione.inizio.toDate().toLocaleDateString('it-IT', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) + " ore " +
                                                selectedPrenotazione.inizio.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p>
                                            Fine: {selectedPrenotazione.fine.toDate().toLocaleDateString('it-IT', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) + " ore " +
                                                selectedPrenotazione.fine.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                        </p>

                                        <p>Studio: {selectedPrenotazione.studio}</p>
                                        <p>Stato: {selectedPrenotazione.stato}</p>
                                        <p>Fonico: {findFonico(selectedPrenotazione.fonico)}</p>
                                        <p>Note: {selectedPrenotazione.note ? selectedPrenotazione.note : ""}</p>
                                        <p>Prenotato da: {selectedPrenotazione.prenotatoDa ? selectedPrenotazione.prenotatoDa : ""}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </Modal.Body>


                    <Modal.Footer>
                        {showDeleteConfirmation ? (
                            <>
                                <Button variant="secondary" style={{}} onClick={handleCancelDelete}>Annulla</Button>
                            </>
                        ) : (
                            <>
                                {!isEditing ? (
                                    <>
                                        <Button variant="secondary" style={{ background: "transparent", border: "2px solid green", color: "green" }} onClick={handleEdit}>Modifica</Button>
                                        <Button variant="danger" style={{ background: "transparent", color: "red", border: "2px solid red" }} onClick={handleDelete}>Elimina</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="secondary" onClick={() => setIsEditing(false)} style={{ background: "transparent", color: "red", border: "2px solid red" }}>Annulla</Button>
                                        <Button variant="primary" onClick={handleSaveChanges} style={{ background: "transparent", color: "green", border: "2px solid green" }}>Salva</Button>
                                    </>
                                )}
                                <Button variant="secondary" style={{ background: "transparent", border: "2px solid black", color: "black" }} onClick={handleServiceModalClose}>Chiudi</Button>
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
                                    {endHoursOptions.map(hour => (
                                        <option key={hour} value={hour}>
                                            {hour}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId="formStudio">
                                <Form.Label>Studio</Form.Label>
                                <select
                                    value={studioPren} // Usa il valore per controllare l'opzione selezionata
                                    onChange={(e) => handleNewInputChange('studio', Number(e.target.value))} // Converti il valore in numero
                                >
                                    {[1, 2, 3].map(studio => (
                                        <option key={studio} value={studio}>
                                            {studio}
                                        </option>
                                    ))}
                                </select>
                            </Form.Group>


                            <select onChange={(e) => handleFonicoSelectionAdd(e.target.value)}>
                                {
                                    fonici.map((fonico) => (
                                        <option key={fonico.id} value={fonico.id} selected={fonico.id == 1}>
                                            {fonico.nome}
                                        </option>
                                    ))
                                }
                            </select>

                            <Form.Group controlId="formNote">
                                <Form.Label>Note</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Note"
                                    value={newPrenotazione.note}
                                    onChange={(e) => handleNewInputChange('note', e.target.value)}
                                />
                            </Form.Group>

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
                <Modal.Header>
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
                                    value="Produzione"
                                    checked={services.includes('Produzione')}
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
                                    value="MixAndMaster"
                                    checked={services.includes('MixAndMaster')}
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
                                    <option key={fonico.id} value={fonico.id} selected={fonico.id == 1}>
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
                        <Form.Group controlId="formNote">
                            <Form.Label>Telefono</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="Note"
                                rows={3}
                                value={newPrenotazione.note}
                                onChange={(e) => handleNewInputChange('note', e.target.value)}

                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" style={{ background: "transparent", border: "2px solid black", color: "black" }} onClick={() => {
                        setServiceModalShow(false)
                        setIsPeriod(false)
                    }}>Chiudi</Button>
                    <Button variant="primary" onClick={handleInsert}>Inserisci</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Calendar;
