import React, { useState, useEffect } from 'react';
import usePrenotazioni from '../../booking/useBooking';
import './Studios.css';
import stu1 from "../../assets/stu1.png";
import stu2 from "../../assets/stu2.png";
import stu3 from "../../assets/stu3.png";

const getLocalDateTimeString = () => {
  const now = new Date();
  // Ottieni la data e l'orario in formato locale
  const localDateTimeString = now.toLocaleString('sv-SE', { timeZoneName: 'short' });
  // Trasformalo in formato ISO, se necessario
  return localDateTimeString.slice(0, 16); // Mantieni solo la parte della data e dell'orario
};

const Studio = ({ occupato, prenotazione, index }) => {
  const { fonici } = usePrenotazioni();

  const findFonico = (id) => {
    const fonico = fonici.find((fon) => fon.id === id);
    return fonico && fonico.nome ? fonico.nome : "";
  };

  return (
    <div className={`studio ${occupato ? 'occupato' : 'libero'} border rounded w-100`}>
      <div>
        <img className='w-100' style={{borderRadius:"5px"}} src={index === 1 ? stu1 : index === 2 ? stu2 : stu3} alt={`Foto Studio ${index}`} />
        <div className='d-flex flex-row align-items-center justify-content-between pt-3'>
          <h5 style={{ color: occupato ? "#08B1DF" : "black", fontWeight: 900 }}>
            Studio {index}
          </h5>
          <div className='d-flex flex-row align-items-center justify-content-start'>
            <div style={{ width: "20px", height: "20px", backgroundColor: occupato ? "#08B1DF" : "black", borderRadius: "50%" }}>
            </div>
            <div className='d-flex flex-column align-items-start'>
              <p style={{ height: "fit-content", margin: "0px", color: occupato ? "#08B1DF" : "black", marginLeft: "5px" }}>
                {occupato ? "occupato" : "libero"}
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="prenotazione d-flex flex-column align-items-start">
            <p><span style={{ color: "grey", textAlign: "start", whiteSpace: "nowrap", marginRight:"10px"  }}>Utente:</span> {occupato && prenotazione.nomeUtente}</p>
            <p>
              <span style={{ color: "grey", textAlign: "start", whiteSpace: "nowrap", marginRight:"10px"  }}>Inizio:</span>
              {occupato && prenotazione.inizio.toDate().toLocaleDateString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) + " ore " +
                prenotazione.inizio.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </p>

            <p>
              <span style={{ color: "grey", textAlign: "start", whiteSpace: "nowrap", marginRight:"10px"  }}>Fine:</span>
              {occupato && prenotazione.fine.toDate().toLocaleDateString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) + " ore " +
                prenotazione.fine.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </p>

            <p><span style={{ color: "grey", textAlign: "start", whiteSpace: "nowrap", marginRight:"10px" }}>Telefono:</span> {occupato && prenotazione.telefono}</p>
            <p><span style={{ color: "grey", textAlign: "start", whiteSpace: "nowrap", marginRight:"10px"  }}>Fonico:</span> {occupato && findFonico(prenotazione.fonico)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Studios = () => {
  const [selectedDateTime, setSelectedDateTime] = useState(getLocalDateTimeString());
  const { prenotazioni, loading, error } = usePrenotazioni(new Date(selectedDateTime));

  const handleDateTimeChange = (e) => {
    setSelectedDateTime(e.target.value);
  };

  const getStudioStatus = (studioNumber) => {
    const studioPrenotazioni = prenotazioni.filter(prenotazione => prenotazione.studio === studioNumber && prenotazione.stato === 2);
    const currentPrenotazione = studioPrenotazioni.find(prenotazione => {
      const inizio = prenotazione.inizio.toDate();
      const fine = prenotazione.fine.toDate();
      return new Date(selectedDateTime) >= inizio && new Date(selectedDateTime) <= fine;
    });

    return currentPrenotazione ? { occupato: true, prenotazione: currentPrenotazione } : { occupato: false, prenotazione: null };
  };

  const studio1 = getStudioStatus(1);
  const studio2 = getStudioStatus(2);
  const studio3 = getStudioStatus(3);

  useEffect(() => {
    console.log("prenotazioni", prenotazioni);
  }, []);

  return (
    <div className="container">
      <div className="datetime-select my-3">
        <label htmlFor="dateTime">Seleziona Data e Ora:</label>
        <input type="datetime-local" id="dateTime" className="form-control" value={selectedDateTime} onChange={handleDateTimeChange} />
      </div>
      
        <div className="row">
          <div className="col-md-4 d-flex flex-column align-items-center">
            <h4>Studio 1</h4>
            <Studio occupato={studio1.occupato} prenotazione={studio1.prenotazione} index={1} />
          </div>
          <div className="col-md-4 d-flex flex-column align-items-center">
            <h4>Studio 2</h4>
            <Studio occupato={studio2.occupato} prenotazione={studio2.prenotazione} index={2} />
          </div>
          <div className="col-md-4 d-flex flex-column align-items-center">
            <h4>Studio 3</h4>
            <Studio occupato={studio3.occupato} prenotazione={studio3.prenotazione} index={3} />
          </div>
        </div>
      
    </div>
  );
};

export default Studios;
