import React, { useState, useEffect } from 'react';
import usePrenotazioni from '../../booking/useBooking';
import Slider from 'react-slick';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const giorniSettimana = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} slick-next`}
      style={{ ...style, borderRadius: '50%', display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClick}
    >
      <i className="fa-solid fa-chevron-right" style={{ color: "black", fontSize: "40px" }}></i>
    </div>
  );
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

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} slick-prev`}
      style={{ ...style, borderRadius: '50%', display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClick}
    >
      <i className="fa-solid fa-chevron-left" style={{ color: "black", fontSize: "40px" }}></i>
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

const getWeekDays = () => {
  const today = new Date();
  const currentDay = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay + 1); // Lunedì della settimana corrente
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

const Fonici = () => {
  const { prenotazioni, fonici } = usePrenotazioni();
  const [selectedFonicoId, setSelectedFonicoId] = useState(null);
  const [totalHours, setTotalHours] = useState(0);
  const [currentPrenotazioni, setCurrentPrenotazioni] = useState([]);
  const [view, setView] = useState('weekly');
  const [currentWeek, setCurrentWeek] = useState(getWeekDays());
  const [showModal, setShowModal] = useState(false);
  const [selectedPrenotazione, setSelectedPrenotazione] = useState(null);
  const [selectedDay, setSelectedDay] = useState(getFormattedDate(new Date()));

  useEffect(() => {
    if (selectedFonicoId !== null) {
      // Filtra le prenotazioni per il fonico selezionato
      const fonicoPrenotazioni = prenotazioni.filter(
        (p) => p.fonicoId === selectedFonicoId
      );

      // Calcola le ore totali
      const total = fonicoPrenotazioni.reduce((sum, p) => {
        const inizio = p.inizio.toDate();
        const fine = p.fine.toDate();
        const ore = (fine - inizio) / (1000 * 60 * 60); // Conversione da millisecondi a ore
        return sum + ore;
      }, 0);
      setTotalHours(total);
      setCurrentPrenotazioni(fonicoPrenotazioni);
    }
  }, [selectedFonicoId, prenotazioni]);

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

  const handleShowModal = (prenotazione) => {
    setSelectedPrenotazione(prenotazione);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedPrenotazione(null);
    setShowModal(false);
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
                            <tr key={timeSlot}>
                                <td style={{ width: '80px', textAlign: 'right', paddingRight: '10px', verticalAlign: 'middle' }}>
                                    {timeSlot}
                                </td>
                                {currentWeek.map(day => {
                                    const slot = `${day.date}T${timeSlot}`;
                                    const bookings = prenotazioni.filter(pren => {
                                        const prenDate = pren.inizio.toDate();
                                        return getFormattedDate(prenDate) === day.date &&
                                            prenDate.getHours() === hour;
                                    });
                                    return (
                                        <td key={day.date} style={{ height: '60px', textAlign: 'center', backgroundColor:  'transparent' }}>
                                            {bookings.length 
                                            ? (
                                                bookings.map(booking => (
                                                    <div key={booking.id} style={{ backgroundColor: '#08B1DF', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '5px' }}>
                                                        <b style={{ fontWeight: 900, marginLeft: "10px" }}>{booking.nomeUtente}</b>
                                                    </div>
                                                ))
                                            ) : (
                                                <div
                                                    style={{
                                                        color: "transparent",
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

  return (
    <div>
      <h1>Lista dei Fonici</h1>
      <div className="d-flex flex-wrap">
        {fonici.map(fonico => (
          <Button
            key={fonico.id}
            variant="primary"
            onClick={() => setSelectedFonicoId(fonico.id)}
            style={{ margin: '5px' }}
          >
            {fonico.nome}
          </Button>
        ))}
      </div>

      {selectedFonicoId !== null && (
        <div>
          <h2>Dettagli per il fonico selezionato</h2>
          <p>Ore totali prenotate: {totalHours.toFixed(2)}</p>
          <div style={{ marginBottom: '20px' }}>
            <Button onClick={() => handleWeekChange(-1)}>Settimana Precedente</Button>
            <Button onClick={() => handleWeekChange(1)}>Settimana Successiva</Button>
          </div>
          {renderWeekly()}
        </div>
      )}

      {selectedPrenotazione && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Dettagli Prenotazione</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formPrenotazioneId">
                <Form.Label>ID Prenotazione</Form.Label>
                <Form.Control type="text" readOnly value={selectedPrenotazione.id} />
              </Form.Group>
              <Form.Group controlId="formPrenotazioneUtente">
                <Form.Label>Nome Utente</Form.Label>
                <Form.Control type="text" readOnly value={selectedPrenotazione.nomeUtente} />
              </Form.Group>
              <Form.Group controlId="formPrenotazioneInizio">
                <Form.Label>Inizio</Form.Label>
                <Form.Control type="text" readOnly value={selectedPrenotazione.inizio.toDate().toLocaleString()} />
              </Form.Group>
              <Form.Group controlId="formPrenotazioneFine">
                <Form.Label>Fine</Form.Label>
                <Form.Control type="text" readOnly value={selectedPrenotazione.fine.toDate().toLocaleString()} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Chiudi
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Fonici;
