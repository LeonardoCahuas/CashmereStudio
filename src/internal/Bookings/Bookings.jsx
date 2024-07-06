import React, { useState } from 'react';
import usePrenotazioni from '../../booking/useBooking';
import { Modal, Button, Table, Pagination, Form } from 'react-bootstrap';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import './Bookings.css'; // Import del file CSS

const BookingModal = ({ show, onHide, prenotazione }) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Dettagli Prenotazione</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {prenotazione && (
        <div>
          <p>Nome Utente: {prenotazione.nomeUtente}</p>
          <p>Email: {prenotazione.email}</p>
          <p>Telefono: {prenotazione.telefono}</p>
          <p>Inizio: {prenotazione.inizio.toDate().toLocaleString()}</p>
          <p>Fine: {prenotazione.fine.toDate().toLocaleString()}</p>
          <p>Studio: {prenotazione.studio}</p>
        </div>
      )}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>Chiudi</Button>
    </Modal.Footer>
  </Modal>
);

const ConfirmDeleteModal = ({ show, onHide, onDelete }) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Conferma Eliminazione</Modal.Title>
    </Modal.Header>
    <Modal.Body>Sei sicuro di voler eliminare questa prenotazione?</Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>Annulla</Button>
      <Button variant="danger" onClick={onDelete}>Elimina</Button>
    </Modal.Footer>
  </Modal>
);

const Bookings = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrenotazione, setSelectedPrenotazione] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStudio, setSelectedStudio] = useState('');
  const { prenotazioni, loading, error, setPrenotazioni } = usePrenotazioni(new Date());
  const prenotazioniPerPage = 10;

  const handleView = (prenotazione) => {
    setSelectedPrenotazione(prenotazione);
    setShowViewModal(true);
  };

  const handleDelete = (prenotazione) => {
    setSelectedPrenotazione(prenotazione);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'prenotazioni', selectedPrenotazione.id));
      setPrenotazioni(prenotazioni.filter(p => p.id !== selectedPrenotazione.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Errore nell\'eliminazione della prenotazione:', error);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const indexOfLastPrenotazione = currentPage * prenotazioniPerPage;
  const indexOfFirstPrenotazione = indexOfLastPrenotazione - prenotazioniPerPage;

  const sortedPrenotazioni = prenotazioni.sort((a, b) => {
    const dateA = a.inizio.toDate();
    const dateB = b.inizio.toDate();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const filteredPrenotazioni = sortedPrenotazioni.filter(p => {
    const matchesDate = selectedDate ? p.inizio.toDate().toDateString() === new Date(selectedDate).toDateString() : true;
    const matchesStudio = selectedStudio ? p.studio?.toString() === selectedStudio : true;
    return matchesDate && matchesStudio;
  });

  const currentPrenotazioni = filteredPrenotazioni.slice(indexOfFirstPrenotazione, indexOfLastPrenotazione);
  const totalPages = Math.ceil(filteredPrenotazioni.length / prenotazioniPerPage);

  return (
    <div className="container">
      <h3 className="mt-3">Prenotazioni</h3>
      <div className="controls">
        <Form.Group controlId="sortOrder">
          <Form.Label>Ordina per Data</Form.Label>
          <Form.Control as="select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Crescente</option>
            <option value="desc">Decrescente</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="selectedDate">
          <Form.Label>Filtra per Data</Form.Label>
          <Form.Control
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="selectedStudio">
          <Form.Label>Filtra per Studio</Form.Label>
          <Form.Control as="select" value={selectedStudio} onChange={(e) => setSelectedStudio(e.target.value)}>
            <option value="">Tutti</option>
            <option value="1">Studio 1</option>
            <option value="2">Studio 2</option>
            <option value="3">Studio 3</option>
          </Form.Control>
        </Form.Group>
      </div>
      {prenotazioni.length < 1 ? (
        <div>Loading...</div>
      )  : (
        <div>
          <Table striped bordered hover className="table-container">
            <thead>
              <tr>
                <th>Nome Utente</th>
                <th>Email</th>
                <th>Telefono</th>
                <th>Inizio</th>
                <th>Fine</th>
                <th>Studio</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {currentPrenotazioni.map(prenotazione => (
                <tr key={prenotazione.id}>
                  <td>{prenotazione.nomeUtente}</td>
                  <td>{prenotazione.email}</td>
                  <td>{prenotazione.telefono}</td>
                  <td>{prenotazione.inizio.toDate().toLocaleString()}</td>
                  <td>{prenotazione.fine.toDate().toLocaleString()}</td>
                  <td>{prenotazione.studio}</td>
                  <td className="actions">
                    <Button variant="primary" onClick={() => handleView(prenotazione)}>Visualizza</Button>
                    <Button variant="danger" onClick={() => handleDelete(prenotazione)}>Elimina</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination>
            {[...Array(totalPages).keys()].map(page => (
              <Pagination.Item key={page + 1} active={page + 1 === currentPage} onClick={() => paginate(page + 1)}>
                {page + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      )}
      <BookingModal show={showViewModal} onHide={() => setShowViewModal(false)} prenotazione={selectedPrenotazione} />
      <ConfirmDeleteModal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} onDelete={confirmDelete} />
    </div>
  );
};

export default Bookings;
