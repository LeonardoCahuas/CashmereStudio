import React, { useState, useEffect } from 'react';
import usePrenotazioni from '../../booking/useBooking';
import { Modal, Button, Table, Pagination, Form } from 'react-bootstrap';

function createWhatsAppLink(prenotazione) {
  const { telefono, nomeUtente, inizio, fine, services } = prenotazione;

  // Assicurati che inizio e fine siano oggetti Date
  const inizioDate = inizio.toDate();
  const fineDate = fine.toDate();

  // Formattazione della data e dell'orario secondo il formato specificato
  const formatDate = (date) => date.toLocaleDateString('it-IT');
  const formatTime = (date) => date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  // Codifica dei componenti del testo
  const nomeUtenteEncoded = encodeURIComponent(nomeUtente);
  const dataInizio = formatDate(inizioDate);
  const orarioInizio = formatTime(inizioDate);
  const orarioFine = formatTime(fineDate);
  const serviziEncoded = services.length > 0 ? encodeURIComponent(services.join(',')) : '';

  // Creazione del testo del messaggio
  const testo = `Ciao%20${nomeUtenteEncoded},%20abbiamo%20ricevuto%20una%20prenotazione%20il%20giorno%20${encodeURIComponent(dataInizio)}%20dalle%20${encodeURIComponent(orarioInizio)}%20alle%20${encodeURIComponent(orarioFine)}${serviziEncoded.length > 0 ? `%20con%20servizi%20${serviziEncoded}` : "%20"}.%20Il%20prezzo%20della%20tua%20sessione%20è%20di`;

  // Creazione del link
  return `https://wa.me/${telefono}?text=${testo}`;
}

function Confirm() {
  const { prenotazioni, loading, error, updatePrenotazioneStato, fonici } = usePrenotazioni();
  const [showModal, setShowModal] = useState(false);
  const [selectedPrenotazione, setSelectedPrenotazione] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
  const [selectedFonico, setSelectedFonico] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 602);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call initially to set the correct state
    console.log("fonici")
    console.log(fonici)
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const itemsPerPage = 10;
  useEffect(() => {
    console.log("fonici")
    console.log(fonici)
  }, [fonici])
  const handleConferma = (id) => {
    updatePrenotazioneStato(id, 2, selectedFonico);
    setShowModal(false);
  };

  const handleRifiuta = (id) => {
    updatePrenotazioneStato(id, 0, 0);
    setShowModal(false);
  };

  const handleShowModal = (prenotazione) => {
    console.log("prenotazionee")
    console.log(prenotazione)
    setSelectedPrenotazione(prenotazione);
    setShowModal(true);
  };

  const handleFonicoSelection = (fonico) => {
    console.log(fonico)
    setSelectedFonico(fonico)
  }

  const handleCloseModal = () => {
    setSelectedPrenotazione(null);
    setShowModal(false);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = prenotazioni.filter(prenotazione => prenotazione.stato === 1).slice(indexOfFirstItem, indexOfLastItem);
  const totalItems = prenotazioni.filter(prenotazione => prenotazione.stato === 1).length;

  return (
    <div className='w-100 d-flex flex-column align-items-center'>
      <div className={`${isMobile ? "w-100" : "w-100"}`}>
        <h2>Prenotazioni in Attesa di Conferma</h2>
        <Table striped bordered hover className="table-container">
          <thead>
            <tr>
              <th>Nome Instagram</th>
              <th>Telefono</th>
              {!isMobile && <th>Servizi</th>}

              {!isMobile && <th>Inizio</th>}
              {!isMobile && <th>Fine</th>}
              {!isMobile && <th>Studio</th>}
              {!isMobile && <th>Fonico</th>}
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((prenotazione) => (
              <tr key={prenotazione.id}>
                <td>{isMobile ? <a href={`https://www.instagram.com/${prenotazione.nomeUtente}`}><i class="fa fa-instagram"></i> {prenotazione.nomeUtente}</a> : <a href={`https://www.instagram.com/${prenotazione.nomeUtente}`}>{prenotazione.nomeUtente}</a>}</td>
                <td>
                  <a href={createWhatsAppLink(prenotazione)}><i className="fa fa-phone"></i>{prenotazione.telefono}</a>
                </td>
                {!isMobile && <td>{prenotazione.services && prenotazione?.services.map((servi) => <p>{servi}</p>)}</td>}

                {!isMobile && <td>
                  {prenotazione.inizio.toDate().toLocaleDateString('it-IT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) + " ore " +
                    prenotazione.inizio.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </td>}
                {!isMobile && <td>
                  {prenotazione.fine.toDate().toLocaleDateString('it-IT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) + " ore " +
                    prenotazione.fine.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </td>}
                {!isMobile && <td>{prenotazione.studio}</td>}
                {!isMobile && <td>{prenotazione.sessionWithFonico ? "si" : "no"}</td>}
                <td>
                  <p style={{ textDecoration: "underline", cursor: "pointer", margin: "0px" }} onClick={() => handleShowModal(prenotazione)}>Visualizza</p>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pagination>
          {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, index) => (
            <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>

        {selectedPrenotazione && (
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Dettagli Prenotazione</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>ID: {selectedPrenotazione.id}</p>
              <p>Nome Utente: {selectedPrenotazione.nomeUtente}</p>

              <p>Telefono: {selectedPrenotazione.telefono}</p>
              <div className=' mb-3 d-flex flex-row align-items-center justify-content-start' style={{ gap: "10px" }}>Servizi: {selectedPrenotazione.services && selectedPrenotazione.services.map((servi) => <p className='m-0'>{servi}</p>)}</div>
              <p>
                Fine: {selectedPrenotazione.inizio.toDate().toLocaleDateString('it-IT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) + " ore " +
                  selectedPrenotazione.inizio.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {/* 
              <p>
                                            Fine: {selectedPrenotazione.fine.toDate().toLocaleDateString('it-IT', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) + " ore " +
                                                selectedPrenotazione.fine.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                        </p> */}
              <p>
                Inizio: {selectedPrenotazione.fine.toDate().toLocaleDateString('it-IT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) + " ore " +
                  selectedPrenotazione.fine.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p>Studio: {selectedPrenotazione.studio}</p>
              <p>Stato: {selectedPrenotazione.stato}</p>
              <select onChange={(e) => handleFonicoSelection(e.target.value)}>
                {
                  selectedPrenotazione.sessionWithFonico ?
                    fonici.map((fonico) => (
                      <option key={fonico.id} value={fonico.id}>
                        {fonico.nome}
                      </option>
                    ))
                    :
                    <option key={1} value={1}>
                      Senza fonico
                    </option>
                }
              </select>

            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>Chiudi</Button>
              <Button variant="success" onClick={() => handleConferma(selectedPrenotazione.id)}>Conferma</Button>
              <Button variant="danger" onClick={() => handleRifiuta(selectedPrenotazione.id)}>Rifiuta</Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Confirm;
