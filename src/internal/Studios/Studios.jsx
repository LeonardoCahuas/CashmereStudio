import React, { useState, useEffect } from 'react';
import usePrenotazioni from '../../booking/useBooking';
import './Studios.css'; // Importa il file CSS

const Studio = ({ occupato, prenotazione }) => {
  return (
    <div className={`studio ${occupato ? 'occupato' : 'libero'} border rounded w-100`}>
      {occupato ? (
        <div className="prenotazione">
          <p>Utente: {prenotazione.nomeUtente}</p>
          <p>Inizio: {prenotazione.inizio.toDate().toLocaleString()}</p>
          <p>Fine: {prenotazione.fine.toDate().toLocaleString()}</p>
          <p>Telefono: {prenotazione.telefono}</p>
        </div>
      ) : (
        <div className="libero">
          <p>Libero</p>
        </div>
      )}
    </div>
  );
};

const Studios = () => {
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const { prenotazioni, loading, error } = usePrenotazioni(selectedDateTime);

  const handleDateTimeChange = (e) => {
    const { value } = e.target;
    setSelectedDateTime(new Date(value));
  };

  const getStudioStatus = (studioNumber) => {
    const studioPrenotazioni = prenotazioni.filter(prenotazione => prenotazione.studio === studioNumber && prenotazione.stato == 2);
    const currentPrenotazione = studioPrenotazioni.find(prenotazione => {
      const inizio = prenotazione.inizio.toDate();
      const fine = prenotazione.fine.toDate();
      return selectedDateTime >= inizio && selectedDateTime <= fine;
    });

    return currentPrenotazione ? { occupato: true, prenotazione: currentPrenotazione } : { occupato: false, prenotazione: null };
  };

  const studio1 = getStudioStatus(1);
  const studio2 = getStudioStatus(2);
  const studio3 = getStudioStatus(3);

  useEffect(() => {
    console.log("prenotazioni");
    console.log(prenotazioni);
  }, [prenotazioni]);

  return (
    <div className="container">
      <div className="datetime-select my-3">
        <label htmlFor="dateTime">Seleziona Data e Ora:</label>
        <input type="datetime-local" id="dateTime" className="form-control" value={selectedDateTime.toISOString().slice(0, 16)} onChange={handleDateTimeChange} />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <div className="row">
          <div className="col-md-4 d-flex flex-column align-items-center">
            <h4>Studio 1</h4>
            <Studio occupato={studio1.occupato} prenotazione={studio1.prenotazione} />
          </div>
          <div className="col-md-4 d-flex flex-column align-items-center">
          <h4>Studio 2</h4>
            <Studio occupato={studio2.occupato} prenotazione={studio2.prenotazione} />
          </div>
          <div className="col-md-4 d-flex flex-column align-items-center">
          <h4>Studio 3</h4>
            <Studio occupato={studio3.occupato} prenotazione={studio3.prenotazione} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Studios;
