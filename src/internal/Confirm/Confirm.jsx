import React, {useState} from 'react';
import usePrenotazioni from '../../booking/useBooking';
import { Modal, Button, Table, Pagination, Form } from 'react-bootstrap';

function Confirm() {
    const { prenotazioni, loading, error, updatePrenotazioneStato } = usePrenotazioni();
    const [showModal, setShowModal] = useState(false);
    const [selectedPrenotazione, setSelectedPrenotazione] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
  
    const handleConferma = (id) => {
      updatePrenotazioneStato(id, 2);
      setShowModal(false);
    };
  
    const handleRifiuta = (id) => {
      updatePrenotazioneStato(id, 0);
      setShowModal(false);
    };
  
    const handleShowModal = (prenotazione) => {
      setSelectedPrenotazione(prenotazione);
      setShowModal(true);
    };
  
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
        <div className='w-75'>
        <h2>Prenotazioni in Attesa di Conferma</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nome Utente</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Inizio</th>
              <th>Fine</th>
              <th>Studio</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(prenotazione => (
              <tr key={prenotazione.id}>
                <td>
                  {prenotazione.nomeUtente}
                  <a href={`https://www.instagram.com/${prenotazione.nomeUtente}`} target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-instagram" style={{ marginLeft: '8px' }}></i>
                  </a>
                </td>
                <td>{prenotazione.email}</td>
                <td>{prenotazione.telefono}</td>
                <td>{prenotazione.inizio.toDate().toLocaleString()}</td>
                <td>{prenotazione.fine.toDate().toLocaleString()}</td>
                <td>{prenotazione.studio}</td>
                <td>{prenotazione.stato}</td>
                <td>
                  <Button variant="primary" onClick={() => handleShowModal(prenotazione)}>Visualizza</Button>
                  <Button variant="success" onClick={() => handleConferma(prenotazione.id)}>Conferma</Button>
                  <Button variant="danger" onClick={() => handleRifiuta(prenotazione.id)}>Rifiuta</Button>
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
              <p>Email: {selectedPrenotazione.email}</p>
              <p>Telefono: {selectedPrenotazione.telefono}</p>
              <p>Inizio: {selectedPrenotazione.inizio.toDate().toLocaleString()}</p>
              <p>Fine: {selectedPrenotazione.fine.toDate().toLocaleString()}</p>
              <p>Studio: {selectedPrenotazione.studio}</p>
              <p>Stato: {selectedPrenotazione.stato}</p>
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
  