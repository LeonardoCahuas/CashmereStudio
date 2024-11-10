import React, { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Box, MenuItem, Select, FormControl, InputLabel, Button as MuiButton } from '@mui/material';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import usePrenotazioni from '../../contexts/PrenotazioniContext';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase/firestore';

import { Table, Button, Modal, Form } from 'react-bootstrap';

const hours = Array.from({ length: 19 }, (_, i) => { // Cambiato da 13 a 18 per includere le ore fino alle 4
    const hour = (i + 10) % 24; // Calcola l'ora in formato 24 ore
    return String(hour).padStart(2, '0') + ':00';
});

const months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const giorniSettimana = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

const formatDateForInput = (date) => {
    console.log(date)
    // Assumiamo che date sia un oggetto Date
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
};
function formatTimestampToTime(timestamp) {
    // Converti il timestamp in millisecondi
    const milliseconds = timestamp.seconds * 1000;

    // Crea un oggetto Date a partire dai millisecondi
    const date = new Date(milliseconds);

    // Usa toLocaleTimeString per ottenere l'orario in formato HH:MM (24 ore)
    const formattedTime = date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return formattedTime;
}



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
    const today1 = new Date();
    const today = new Date(today1);
    today.setDate(today.getDate() - 1);
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

const Calendar = ({ isAdmin, day, week, setDay, setWeek, format, setFormat }) => {
    const [value, setValue] = useState(1);
    const [selectedDay, setSelectedDay] = useState(day ? day :getFormattedDate(new Date()));
    const [showModal, setShowModal] = useState(false);
    const [studioBookings, setStudioBookings] = useState([]);
    const [selectedPrenotazione, setSelectedPrenotazione] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
    const [view, setView] = useState(format); // 'daily' or 'weekly'
    const [currentWeek, setCurrentWeek] = useState(week ? week : getCurrentWeek());
    const [blockMode, setBlockMode] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [serviceModalShow, setServiceModalShow] = useState(false);
    const [services, setServices] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState(null)
    const [repeat, setRepeat] = useState(null)
    const [studioPren, setStudioPren] = useState(1)
    const [selectedFonico, setSelectedFonico] = useState(0)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [adding, setAdding] = useState(false)
    const [inizio, setInizio] = useState()
    const [rent, setRent] = useState(false)
    const [rentUpdate, setRentUpdate] = useState(false)
    const [fine, setFine] = useState()
    const [endHoursOptions, setEndHoursOptions] = useState(hours)
    const [endHoursOptionsEdit, setEndHoursOptionsEdit] = useState(hours)
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
        note: "",
        fonico: 1
    })
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

    const { prenotazioni, addPrenotazione, fonici, modificaPrenotazione, eliminaPrenotazione, handleDeleteAllPeriodPren, addMultiplePrenotazioni } = usePrenotazioni(selectedDay);
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

    const handleDateChange = (e) => {
        const selectedDate = new Date(e.target.value);
        const formattedDate = getFormattedDate(selectedDate);
        setSelectedDay(formattedDate);

        if (view === 'weekly') {
            const dayOfWeek = selectedDate.getDay();
            const diff = selectedDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
            const monday = new Date(selectedDate);
            monday.setDate(diff);
            const week = Array.from({ length: 7 }, (_, i) => {
                const day = new Date(monday);
                day.setDate(monday.getDate() + i);
                return {
                    label: `${giorniSettimana[day.getDay()]} ${day.getDate()}/${day.getMonth() + 1}`,
                    date: getFormattedDate(day),
                };
            });
            setCurrentWeek(week);
        }

        // Update the studio tab to match the day of the week (1-7, with 7 for Sunday)
        const dayValue = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();

        // Trigger a re-fetch of bookings for the selected date
        // Assuming you have a function to fetch bookings, call it here
        // fetchBookingsForDate(formattedDate);
    };

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
        console.log("value" + value)
        setNewPrenotazione(prev => ({
            ...prev,
            fine: value
        }));
    };

    const handleHourChangeEdit = (hour, type) => {
        console.log(hour)
        if (type == "inizio") {
            setInizio(hour)
        } else if (type == "fine") {
            setFine(hour)
        }
        const combinedDateTime = `${selectedDay.date}T${hour}:00`;

        // Crea un oggetto Date dalla stringa ISO
        const baseDate = new Date(combinedDateTime);
        const timestampnew = Timestamp.fromDate(baseDate);


        const updatedPrenotazione = {
            ...selectedPrenotazione,
            [type]: timestampnew
        };
        /* setSelectedPrenotazione(prev => ({
            ...prev,
            [type]: value
        })); */
        /* setSelectedPrenotazione({...selectedPrenotazione, [type]: hour}) */
        /* modificaPrenotazione(selectedPrenotazione.id, updatedPrenotazione) */
    };



    const handleFonicoSelection = (fonico) => {
        setSelectedFonico(fonico)
    }

    const handleFonicoSelectionAdd = (fonico) => {
        console.log(fonico)
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
        console.log(date)
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
        const mergedSlots = [];
        let currentSlot = null;
        /* 
                selectedSlots.sort((a, b) => a - b);
        
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
                }); */

        // Aggiungi l'ultimo slot se esiste
        /* if (currentSlot) {
            mergedSlots.push(currentSlot);
        } mergedSlots.forEach(({ inizio, fine }) => {
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
        }); */
        /*  const prens = mergedSlots.map(({ inizio, fine }) => {
             return ({
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
 
         console.log("prens")
         console.log(prens)
         addMultiplePrenotazioni(prens) */

        selectedSlots.forEach(slot => {
            if (slot instanceof Date) {
                const inizio = new Date(slot);
                const fine = new Date(inizio);
                fine.setHours(inizio.getHours() + 1);

                for (let i = 0; i < (repeat || 1); i++) {
                    const newInizio = new Date(inizio);
                    const newFine = new Date(fine);
                    newInizio.setDate(inizio.getDate() + i * 7)
                    newFine.setDate(fine.getDate() + i * 7)
                    addPrenotazione({
                        nomeUtente: username || 'Blocco',
                        studio: value,
                        telefono: phoneNumber || 'Blocco',
                        services,
                        inizio: newInizio,
                        fine: newFine,
                        stato: 2,
                        fonico: selectedFonico,
                        note: "",
                        prenotatoDa: "gestionale",
                        period: uid
                    });
                }
            } else {
                console.error('Invalid slot format:', slot);
            }
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

        console.log(selectedDay)

        const combinedDateTimeInizio = view == "weekly" ? `${selectedDay.date}T${inizio}:00` : `${selectedDay}T${inizio}:00`

        // Crea un oggetto Date dalla stringa ISO
        const baseDateInizio = new Date(combinedDateTimeInizio);
        const timestampnewInizio = Timestamp.fromDate(baseDateInizio);

        const combinedDateTimeFine = view == "weekly" ? `${selectedDay.date}T${fine}:00` : `${selectedDay}T${fine}:00`

        // Crea un oggetto Date dalla stringa ISO
        const baseDateFine = new Date(combinedDateTimeFine);
        const timestampnewFine = Timestamp.fromDate(baseDateFine);
        console.log(selectedPrenotazione.inizio)
        console.log(timestampnewInizio)
        console.log(selectedPrenotazione.fine)
        console.log(timestampnewFine)
        console.log(selectedPrenotazione)
        console.log({
            ...selectedPrenotazione,
            inizio: timestampnewInizio,
            fine: timestampnewFine
        })
        modificaPrenotazione(selectedPrenotazione.id, {
            ...selectedPrenotazione,
            inizio: timestampnewInizio,
            fine: timestampnewFine
        })
        setSelectedPrenotazione({
            ...selectedPrenotazione,
            inizio: timestampnewInizio,
            fine: timestampnewFine
        })
        setIsEditing(false);
    };

    const handleEdit = () => {
        setInizio(formatTimestampToTime(selectedPrenotazione.inizio))
        setFine(formatTimestampToTime(selectedPrenotazione.fine))
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

    const handleSaveNewPrenotazione2 = () => {
        console.log(newPrenStart)
        try {
            let startDate;
            if (newPrenStart.day && typeof newPrenStart === 'object') {
                console.log(newPrenStart)
                const dateStr = newPrenStart.day;
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

    const renderSingleDay = (day) => {
        const bookingsByDay = prenotazioni
            .filter(pren => {
                try {
                    const prenDate = pren.inizio.toDate();
                    return pren.studio === value &&
                        getFormattedDate(prenDate) === day.date && pren.stato === 2;
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

        const occupiedSlots = {};
        const today = new Date();
        const isToday = day.date === getFormattedDate(today);

        return (
            <div className="w-100 d-flex flex-column custom-slider-container">
                <Table striped bordered hover className="table-container" style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
                    <thead>
                        <tr>
                            <th style={{ width: '80px', border: "1px solid black" }}>Orario</th>
                            <th>{day.label} {isToday ? "  (oggi)" : ""}</th>
                        </tr>
                    </thead>
                    <tbody style={{ overflow: "hidden" }}>
                        {Array.from({ length: 19 }, (_, i) => {
                            const hour = (i + 10) % 24; // Calcola l'ora in formato 24 ore
                            const timeSlot = `${String(hour).padStart(2, '0')}:00`;
                            const isNextDay = hour < 10; // Controlla se è un'ora del giorno successivo

                            if (occupiedSlots[`${day.date}-${hour}`]) {
                                return (
                                    <tr key={timeSlot}>
                                        <td style={{ width: '80px', textAlign: 'right', paddingRight: '10px', verticalAlign: 'middle', backgroundColor: "white" }}>
                                            {timeSlot}
                                        </td>
                                    </tr>
                                );
                            }

                            const currentBookings = bookingsByDay.filter(b => {
                                const startHour = b.startHour % 24;
                                let endHour = b.endHour % 24;

                                if (endHour < startHour) {
                                    endHour += 24;
                                }

                                return (startHour <= hour && endHour > hour) || (isNextDay && startHour < 10 && endHour >= 24);
                            });

                            let cellContent = null;
                            let rowSpan = 1;
                            let idEl;
                            let isNow = (() => {
                                const today = new Date();
                                const isToday = day.date === getFormattedDate(today);
                                const currentHour = today.getHours();

                                // Se c'è una prenotazione attiva, controlla se l'ora corrente è nel suo range
                                if (currentBookings.length > 0) {
                                    const booking = currentBookings[0];
                                    let endHour = booking.endHour;

                                    // Gestisci il caso in cui la prenotazione attraversa la mezzanotte
                                    if (booking.endHour < booking.startHour) {
                                        endHour += 24;
                                    }

                                    return isToday && currentHour >= booking.startHour && currentHour < endHour;
                                }

                                // Per gli slot vuoti, controlla se l'ora corrente è nell'ora specifica dello slot
                                return isToday && currentHour === hour;
                            })();

                            if (currentBookings.length > 0) {
                                const booking = currentBookings[0];

                                if (booking.endHour < booking.startHour) {
                                    rowSpan = (24 - booking.startHour) + booking.endHour;
                                } else {
                                    rowSpan = booking.endHour - booking.startHour;
                                }

                                for (let r = 0; r < rowSpan; r++) {
                                    occupiedSlots[`${day.date}-${(hour + r) % 24}`] = true;
                                }

                                const fonico = booking.fonico ? booking.fonico : "nope";
                                idEl = uuidv4();
                                cellContent = (
                                    <div style={{
                                        backgroundColor: isNow ? "lightblue" : '#73c2fb',
                                        color: 'white',
                                        padding: '10px',
                                        borderRadius: '5px',
                                        height: "100%",
                                        display: 'flex',
                                        flexDirection: "column",
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxSizing: 'border-box'
                                    }}
                                        id={idEl} onClick={() => {
                                            setSelectedDay(day)
                                            blockMode ? null : handleShowModal(booking)
                                        }}>
                                        <b style={{ fontWeight: 900 }}>{booking.nomeUtente}, {findFonico(fonico) !== "" ? findFonico(fonico) : "senza fonico"}</b>
                                        <b style={{ fontWeight: 900 }}>{booking.note ? booking.note : ""}</b>
                                        <b>{booking.inizio.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - {booking.fine.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</b>
                                    </div>
                                );
                            } else {
                                cellContent = (
                                    <div style={{ color: "lightgrey", cursor: blockMode ? 'pointer' : 'default', fontSize: "12px" }} onClick={() => blockMode ? handleSlotClick(day.date, hour) : isAdmin ? addBook(day, timeSlot) : null}>
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
                                            backgroundColor: isNow ? "lightblue" : cellContent ? "" : selectedSlots.some(s => s.getTime() === new Date(`${day.date}T${timeSlot}`).getTime()) ? 'black' : 'white',

                                            verticalAlign: 'middle',
                                            padding: '0',
                                            whiteSpace: "nowrap"
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            document.getElementById(idEl).click();
                                        }}
                                    >
                                        {cellContent}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        );
    };


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
                                    onClick={() => {
                                        console.log(day.date)
                                        setSelectedDay(day.date)
                                        setDay(day.date)
                                    }}
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
                                    let endHour = b.endHour % 24; // Gestisci l'ora in formato 24 ore

                                    if (endHour < startHour) { // Gestione prenotazione che attraversa mezzanotte
                                        endHour += 24;
                                    }
                                    return (startHour <= hour && endHour > hour) || (isNextDay && startHour < 10 && endHour >= 24);
                                });

                                let cellContent = null;
                                let rowSpan = 1;
                                let idEl;
                                let isNow = (() => {
                                    const today = new Date();
                                    const isToday = selectedDay === getFormattedDate(today);
                                    const currentHour = today.getHours();

                                    // Se c'è una prenotazione attiva, controlla se l'ora corrente è nel suo range
                                    if (currentBookings.length > 0) {
                                        const booking = currentBookings[0];
                                        let endHour = booking.endHour;

                                        // Gestisci il caso in cui la prenotazione attraversa la mezzanotte
                                        if (booking.endHour < booking.startHour) {
                                            endHour += 24;
                                        }

                                        return isToday && currentHour >= booking.startHour && currentHour < endHour;
                                    }

                                    // Per gli slot vuoti, controlla se l'ora corrente è nell'ora specifica dello slot
                                    return isToday && currentHour === hour;
                                })();
                                if (currentBookings.length > 0) {
                                    const booking = currentBookings[0];

                                    if (booking.endHour < booking.startHour) { // Se attraversa mezzanotte
                                        rowSpan = (24 - booking.startHour) + booking.endHour;
                                    } else {
                                        rowSpan = booking.endHour - booking.startHour;
                                    }

                                    // Segna gli slot come occupati
                                    for (let r = 0; r < rowSpan; r++) {
                                        occupiedSlots[`${selectedDay}-${(hour + r) % 24}`] = true; // Gestisci l'ora in formato 24 ore
                                    }


                                    const fonico = booking.fonico ? booking.fonico : "nope";
                                    idEl = uuidv4()
                                    cellContent = (
                                        <div style={{
                                            backgroundColor: isNow ? "lightblue" : '#73c2fb',
                                            color: 'white',
                                            padding: '10px',
                                            borderRadius: '5px',
                                            height: "100%",
                                            display: 'flex',
                                            flexDirection: "column",
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxSizing: 'border-box'
                                        }}
                                            id={idEl} onClick={() => {
                                                setSelectedDay(selectedDay)
                                                handleShowModal(booking)
                                            }}
                                        >
                                            <b style={{ fontWeight: 900, fontSize: isMobile ? "13.5px" : "15px" }}>{booking.nomeUtente}, {findFonico(fonico) !== "" ? findFonico(fonico) : "senza fonico"}</b>
                                            <b style={{ fontWeight: 900, fontSize: isMobile ? "13.5px" : "15px" }}>{booking.note ? booking.note : ""}</b>
                                            <b style={{ fontSize: isMobile ? "13.5px" : "15px" }}>{booking.inizio.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}-{booking.fine.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</b>
                                        </div>
                                    );
                                } else {
                                    cellContent = (
                                        <div style={{ color: "lightgrey", cursor: blockMode ? 'pointer' : 'default', fontSize: "12px" }} onClick={() => blockMode ? handleSlotClick(day.date, hour) : isAdmin ? addBook(selectedDay, timeSlot) : null}>
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
                                                backgroundColor: isNow ? "lightblue" : currentBookings.length > 0 ? '#73c2fb' : 'white',
                                                verticalAlign: 'middle',
                                                padding: '0',
                                                whiteSpace: "nowrap"
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Blocca la propagazione per evitare loop
                                                document.getElementById(idEl).click(); // Simula il click sul pulsante interno
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
                    if (pren.nomeUtente == "teduaa") {
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
                        let endHour = b.endHour % 24;
                        if (endHour < startHour) {
                            endHour += 24;
                        }
                        return (startHour <= hour && endHour > hour) || (isNextDay && startHour < 10 && endHour >= 24);
                    });

                    let isContent = false;
                    let fonico = "nope";
                    let cellContent = null;
                    let rowSpan = 1;
                    let idEl;

                    // Evita la creazione di celle per slot già occupati dalla prenotazione del giorno precedente
                    if (occupiedSlots[`${day.date}-${hour}`]) {
                        return null;
                    }

                    if (currentBookings.length > 0) {
                        isContent = true;
                        const booking = currentBookings[0];

                        // Se la prenotazione attraversa la mezzanotte, aggiustiamo il rowSpan
                        if (booking.endHour < booking.startHour) {
                            rowSpan = (24 - booking.startHour) + booking.endHour;
                        } else {
                            rowSpan = booking.endHour - booking.startHour;
                        }

                        // Marca tutti gli slot coperti dalla prenotazione (inclusi quelli che attraversano la mezzanotte)
                        for (let r = 0; r < rowSpan; r++) {
                            occupiedSlots[`${day.date}-${(hour + r) % 24}`] = true;
                        }

                        fonico = booking.fonico ? booking.fonico : "nope";
                        idEl = uuidv4();

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
                                boxSizing: 'border-box',
                                flex: 1
                            }} onClick={() => {
                                setSelectedDay(day)
                                blockMode ? null : handleShowModal(booking)
                            }}
                                id={idEl}
                            >
                                <b style={{ fontWeight: 900, fontSize: isMobile ? "13.5px" : "15px" }}>{booking.nomeUtente}, {findFonico(booking.fonico) !== "" ? findFonico(booking.fonico) : "senza fonico"}</b>
                                <b style={{ fontWeight: 900, fontSize: isMobile ? "13.5px" : "15px" }}>{booking.note ? booking.note : ""}</b>
                                <b style={{ fontSize: isMobile ? "13.5px" : "15px" }}> {booking.inizio.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}-{booking.fine.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</b>
                            </div>
                        );
                    } else {
                        // Se non ci sono prenotazioni correnti, inserisci la cella vuota o cliccabile
                        cellContent = (
                            <div style={{ color: "lightgrey", cursor: blockMode ? 'pointer' : 'default', fontSize: "12px" }} onClick={() => blockMode ? handleSlotClick(day.date, hour) : isAdmin ? addBook(day, timeSlot) : null}>
                                {timeSlot}
                            </div>
                        );
                    }

                    return {
                        content: cellContent,
                        rowSpan,
                        isContent,
                        fonico: fonico,
                        idEl: idEl,
                        isNow: (() => {
                            const today = new Date();
                            const isToday = day.date === getFormattedDate(today);
                            const currentHour = today.getHours();

                            // Se c'è una prenotazione attiva, controlla se l'ora corrente è nel suo range
                            if (currentBookings.length > 0) {
                                const booking = currentBookings[0];
                                let endHour = booking.endHour;

                                // Gestisci il caso in cui la prenotazione attraversa la mezzanotte
                                if (booking.endHour < booking.startHour) {
                                    endHour += 24;
                                }

                                return isToday && currentHour >= booking.startHour && currentHour < endHour;
                            }

                            // Per gli slot vuoti, controlla se l'ora corrente è nell'ora specifica dello slot
                            return isToday && currentHour === hour;
                        })()
                    };
                })
            };


            rows.push(row);
        }
        if (!isMobile) {
            return (

                <div className="w-100 d-flex flex-column custom-slider-container overflow-scroll">
                    <Table striped bordered hover className="table-container" >
                        <thead>
                            <tr>
                                <th style={{ width: '80px', border: "1px solid black", fontWeight: 900 }}>Orario</th>
                                {currentWeek.map(day => {
                                    const today = new Date();
                                    const isToday = day.date === getFormattedDate(today);
                                    return (
                                        <th key={day.date} style={{
                                            textAlign: 'center',
                                            backgroundColor: isToday ? '#08B1DF' : 'white',
                                            color: isToday ? 'white' : 'black',
                                            border: isToday ? "1px solid #08B1DF" : "1px solid black"
                                        }}>
                                            {day.label} {isToday ? "  (oggi)" : ""}
                                        </th>
                                    );
                                })}
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

                                        const { content, rowSpan, isContent, fonico, idEl, isNow } = cell;

                                        return (
                                            <td
                                                key={currentWeek[colIndex].date}
                                                rowSpan={rowSpan}
                                                style={{
                                                    textAlign: 'center',
                                                    backgroundColor: isNow ? "lightblue" : isContent ? '#73c2fb' : selectedSlots.some(s => s.getTime() === new Date(`${currentWeek[colIndex].date}T${timeSlot}`).getTime()) ? 'black' : 'white',
                                                    verticalAlign: 'middle',
                                                    padding: '0',
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Blocca la propagazione per evitare loop
                                                    document.getElementById(idEl).click(); // Simula il click sul pulsante interno
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

            )
        } else {
            return (
                <div className='d-flex flex-column'>
                    {currentWeek.map((day, index) => (
                        // Aggiungi una chiave quando usi map per rendere componenti
                        <div key={index}>
                            {renderSingleDay(day)} {/* Assicurati che renderSingleDay restituisca JSX */}
                        </div>
                    ))}
                </div>
            );
        }
    };



    const handleWeekChange = (direction) => {
        const newWeek = currentWeek.map((day, i) => {
            const date = new Date(day.date);
            date.setDate(date.getDate() + direction * 7);
            console.log(i == 0 ? date : "ciao")

            setSelectedDay(date)
            return {
                label: `${giorniSettimana[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`,
                date: getFormattedDate(date),
            };
        });
        setWeek(newWeek)
        setCurrentWeek(newWeek);
    };

    return (
        <div>
            <Box className={`d-flex flex-${isMobile ? "column" : "row"} align-items-center justify-content-between`} sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px', gap: isMobile ? "20px" : "0px" }}>
                <Tabs onChange={handleChange} aria-label="basic tabs example">
                    <Tab className='studiointernalbbutt p-1' onClick={() => setBlockMode(false)} label="Studio 1" style={{ background: value === 1 ? "black" : "white", color: value === 1 ? "white" : "black", border: "1px solid black" }} />
                    <Tab label="Studio 2" className='p-1' onClick={() => setBlockMode(false)} style={{ background: value === 2 ? "black" : "white", color: value === 2 ? "white" : "black", border: "1px solid black" }} />
                    <Tab label="Studio 3" className='p-1' onClick={() => setBlockMode(false)} style={{ background: value === 3 ? "black" : "white", color: value === 3 ? "white" : "black", border: "1px solid black" }} />
                    <Tab label="Studio 4" className='p-1' onClick={() => setBlockMode(false)} style={{ background: value === 4 ? "black" : "white", color: value === 4 ? "white" : "black", border: "1px solid black" }} />
                </Tabs>
                {view == "weekly" && isAdmin && <div className='d-flex flex-row align-items-center justify-content-center mb-2' style={{ gap: "20px" }}>
                    <MuiButton variant="contained" color="primary" onClick={toggleBlockMode} style={{ marginLeft: '20px', background: "transparent", border: "2px solid black", color: "black" }}>
                        {blockMode ? 'Annulla' : 'Blocca'}
                    </MuiButton>
                    {blockMode && selectedSlots.length > 0 && (
                        <MuiButton variant="contained" color="secondary" onClick={handleNext} style={{ background: "transparent", border: "2px solid black", color: "black" }}>
                            Avanti
                        </MuiButton>
                    )}
                </div>
                }
            </Box>
            <div style={{ marginBottom: '20px', display: "flex", flexDirection: "row", alignItems: "center", justifyContent: view == "weekly" ? "space-between" : "center", width: "100%" }}>
                {view === 'weekly' && (
                    <i onClick={() => handleWeekChange(-1)} className="fa-solid fa-arrow-left d-flex flex-column align-items-center justify-content-center" style={{ fontSize: "30px", borderRadius: "50%", border: "2px solid black", width: "40px", height: "40px" }}></i>

                )}
                <FormControl variant="outlined">
                    <select
                        value={view}
                        onChange={(e) => {
                            setView(e.target.value);
                            setBlockMode(false);
                            setSelectedDay(getFormattedDate(new Date()));
                            setFormat(e.target.value)

                        }}
                        onClick={(e) => e.stopPropagation()} // Aggiungi questo per gestire il click
                        style={{ paddingRight: "100px" }}
                        displayEmpty
                    >
                        <option value="daily">Giornaliero</option>
                        <option value="weekly">Settimanale</option>
                    </select>
                </FormControl>
                {view === 'weekly' && (

                    <i onClick={() => {
                        handleWeekChange(1)
                    }} className="fa-solid fa-arrow-right  d-flex flex-column align-items-center justify-content-center" style={{ fontSize: "30px", borderRadius: "50%", border: "2px solid black", width: "40px", height: "40px" }}></i>
                )}
            </div>

            <div>
                <input
                    type="date"
                    onChange={handleDateChange}
                    value={selectedDay}
                />
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

                                        <Form.Group controlId="gg2">
                                            <Form.Label>Inizio</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={inizio}
                                                onChange={(e) => handleHourChangeEdit(e.target.value, 'inizio')}
                                            >
                                                {endHoursOptionsEdit.map(hour => (
                                                    <option key={hour} value={hour}>
                                                        {hour}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>

                                        <Form.Group controlId="gg1">
                                            <Form.Label>Fine</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={fine}
                                                onChange={(e) => handleHourChangeEdit(e.target.value, 'fine')}
                                            >
                                                {endHoursOptionsEdit.map(hour => (
                                                    <option key={hour} value={hour}>
                                                        {hour}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>

                                        <Form.Group controlId="formStudio">
                                            <Form.Label>Studio</Form.Label>
                                            <select
                                                value={selectedPrenotazione.studio} // Usa il valore per controllare l'opzione selezionata
                                                onChange={(e) => handleInputChange('studio', Number(e.target.value))} // Converti il valore in numero
                                            >
                                                {[1, 2, 3, 4].map(studio => (
                                                    <option key={studio} value={studio}>
                                                        {studio}
                                                    </option>
                                                ))}
                                            </select>
                                        </Form.Group>
                                        <Form.Check
                                            type="checkbox"
                                            label="Affitto sala"
                                            checked={rentUpdate}
                                            onChange={(e) => {
                                                console.log(e.target.checked)
                                                handleFonicoSelectionEdit(1)
                                                setRentUpdate(!rentUpdate)
                                            }}
                                        />

                                        <label className='mt-3'>Cambia fonico:</label>
                                        <select className='m-3' onChange={(e) => handleFonicoSelectionEdit(e.target.value)} value={selectedPrenotazione.fonico}>
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
                                        <a href={`https://www.instagram.com/${selectedPrenotazione.nomeUtente}`} target="_blank" rel="noopener noreferrer"> <p>Instagram: {selectedPrenotazione.nomeUtente}</p></a>
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
                                    isAdmin &&
                                    (<>
                                        <Button variant="secondary" style={{ background: "transparent", border: "2px solid green", color: "green" }} onClick={handleEdit}>Modifica</Button>
                                        <Button variant="danger" style={{ background: "transparent", color: "red", border: "2px solid red" }} onClick={handleDelete}>Elimina</Button>
                                    </>)
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
                            <Form.Check
                                type="checkbox"
                                label="Affitto sala"
                                checked={rent}
                                onChange={(e) => {
                                    console.log(e.target.checked)
                                    handleFonicoSelectionAdd(1)
                                    setRent(!rent)
                                }}
                            />

                            <select onChange={(e) => handleFonicoSelectionAdd(e.target.value)} value={newPrenotazione.fonico}>
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
                        <Button variant="primary" onClick={view == "weekly" ? handleSaveNewPrenotazione : handleSaveNewPrenotazione2}>
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
