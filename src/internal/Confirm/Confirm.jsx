import React, { useState, useEffect } from 'react';
import usePrenotazioni from '../../booking/useBooking';
import { Modal, Button, Table, Pagination, Form } from 'react-bootstrap';


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
  const itemsPerPage = 5;
  useEffect(() => {
    console.log("fonici")
    console.log(fonici)
  }, [fonici])
  const handleConferma = (id) => {
    updatePrenotazioneStato(id, 2, selectedFonico);
    setShowModal(false);
  };

  const handleRifiuta = (id) => {
    updatePrenotazioneStato(id, 0);
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
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((prenotazione) => (
              <tr key={prenotazione.id}>
                <td>{isMobile ? <a href={`https://www.instagram.com/${prenotazione.nomeUtente}`}><i class="fa fa-instagram"></i> {prenotazione.nomeUtente}</a> : <a href={`https://www.instagram.com/${prenotazione.nomeUtente}`}>{prenotazione.nomeUtente}</a>}</td>
                <td>{isMobile ? <div><i class="fa fa-phone"></i>{prenotazione.telefono}</div> : prenotazione.telefono}</td>
                {!isMobile && <td>{prenotazione.services && prenotazione?.services.map((servi) => <p>{servi}</p>)}</td>}

                {!isMobile && <td>{prenotazione.inizio.toDate().toLocaleString()}</td>}
                {!isMobile && <td>{prenotazione.fine.toDate().toLocaleString()}</td>}
                {!isMobile && <td>{prenotazione.studio}</td>}
                <td>
                  <p style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => handleShowModal(prenotazione)}>Visualizza</p>
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
              <div>Servizi: {selectedPrenotazione.services && selectedPrenotazione.services.map((servi) => <p>{servi}</p>)}</div>
              <p>Inizio: {selectedPrenotazione.inizio.toDate().toLocaleString()}</p>
              <p>Fine: {selectedPrenotazione.fine.toDate().toLocaleString()}</p>
              <p>Studio: {selectedPrenotazione.studio}</p>
              <p>Stato: {selectedPrenotazione.stato}</p>
              <select onChange={(e) => handleFonicoSelection(e.target.value)}>
                {
                  fonici.map((fonico) => (
                    <option key={fonico.id} value={fonico.id}>
                      {fonico.nome}
                    </option>
                  ))
                }
              </select>

            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>Chiudi</Button>
              <Button variant="success" disabled={selectedFonico == 0} onClick={() => handleConferma(selectedPrenotazione.id)}>Conferma</Button>
              <Button variant="danger" onClick={() => handleRifiuta(selectedPrenotazione.id)}>Rifiuta</Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Confirm;
