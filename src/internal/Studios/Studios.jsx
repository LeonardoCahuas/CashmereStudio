import React, { useState, useEffect } from 'react';
import usePrenotazioni from '../../booking/useBooking';
import './Studios.css'; // Importa il file CSS
import stu1 from "../../assets/stu1.png"
import stu2 from "../../assets/stu3.png"
import stu3 from "../../assets/stu3.png"

const Studio = ({ occupato, prenotazione, index }) => {
  return (
    <div className={`studio ${occupato ? 'occupato' : 'libero'} border rounded w-100`}>
      <div>
        <img className='w-100' src={index == 1 ? stu1 : index == 2 ? stu2 : stu3} />
        <div className='d-flex flex-row align-items-center justify-content-between pt-3'>
          <h5 style={{ color:occupato ? "#08B1DF" : "black", fontWeight:900 }}>
            Studio {index}
          </h5>
          <div className='d-flex flex-row align-items-center justify-content-start'>
            <div style={{ width: "20px", height: "20px", backgroundColor: occupato ? "#08B1DF" : "black", borderRadius: "50%" }}>

            </div>
            <div className='d-flex flex-column align-items-start'>
              <p style={{ height: "fit-content", margin: "0px", color:occupato ? "#08B1DF" : "black", marginLeft:"5px" }}>
                {occupato ? "occupato" : "libero"}
              </p>
            </div>
          </div>
        </div>
        <div>
         
            <div className="prenotazione d-flex flex-column align-items-start">
              <p><p style={{color:"grey"}}>Utente:</p> { occupato && prenotazione.nomeUtente}</p>
              <p><p style={{color:"grey"}}>Inizio:</p> { occupato && prenotazione.inizio.toDate().toLocaleString()}</p>
              <p><p style={{color:"grey"}}>Fine:</p> { occupato && prenotazione.fine.toDate().toLocaleString()}</p>
              <p><p style={{color:"grey"}}>Telefono:</p> { occupato && prenotazione.telefono}</p>
              <p><p style={{color:"grey"}}>Fonico:</p> { occupato && prenotazione.fonico}</p>
            </div>
        
         
        </div>
      </div>
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
      )}
    </div>
  );
};

export default Studios;
