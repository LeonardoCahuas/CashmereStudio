import React, { useState, useEffect } from 'react';
import usePrenotazioni from '../../booking/useBooking';
import { Modal, Button, Table, Pagination, Form } from 'react-bootstrap';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import './Bookings.css'; // Import del file CSS

const BookingModal = ({ show, onHide, prenotazione, findFonico }) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Dettagli Prenotazione</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {prenotazione && (
        <div>
          <p>Nome Utente: {prenotazione.nomeUtente}</p>
          <p>Telefono: {prenotazione.telefono}</p>
          <div className='mb-3 d-flex flex-row align-items-center justify-content-start' style={{ gap: "10px" }}>Servizi: {prenotazione.services && prenotazione.services.map((servi) => <p className='m-0'>{servi}</p>)}</div>
          <p>
            Inizio: {prenotazione.inizio.toDate().toLocaleDateString('it-IT', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) + " ore " +
              prenotazione.inizio.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p>
            Fine: {prenotazione.fine.toDate().toLocaleDateString('it-IT', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) + " ore " +
              prenotazione.fine.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p>Studio: {prenotazione.studio}</p>
          <p>Fonico: {findFonico(prenotazione.fonico)}</p>
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
  const [usernameFilter, setUsernameFilter] = useState('');
  const [selectedFonico, setSelectedFonico] = useState(null)
  const { prenotazioni, loading, error, setPrenotazioni, fonici } = usePrenotazioni(new Date());
  const prenotazioniPerPage = 10;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);

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

  const handleView = (prenotazione) => {
    setSelectedPrenotazione(prenotazione);
    setShowViewModal(true);
  };

  const findFonico = (id) => {
    const fonico = fonici.find((fon) => fon.id == id)
    return fonico && fonico.nome ? fonico.nome : ""
  }

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
    const matchesFonico = selectedFonico ? p.fonico === selectedFonico : true;
    const matchesUsername = usernameFilter ? p.nomeUtente.toLowerCase().includes(usernameFilter.toLowerCase()) : true;
    return matchesDate && matchesStudio && matchesUsername && matchesFonico && p.stato == 2;
  });

  const currentPrenotazioni = filteredPrenotazioni.slice(indexOfFirstPrenotazione, indexOfLastPrenotazione);
  const totalPages = Math.ceil(filteredPrenotazioni.length / prenotazioniPerPage);

  return (
    <div className="">
      <h3 className="">Prenotazioni</h3>
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
          <Form.Label>Filtra per fonico</Form.Label>
          <Form.Control as="select" onChange={(e) => setSelectedFonico(e.target.value)} value={selectedFonico}>
            <option value="">tutti</option>
            {fonici.map((fonico) => (
              <option key={fonico.id} value={fonico.id}>
                {fonico.nome}
              </option>
            ))}
          </Form.Control>
          <Form.Group controlId="usernameFilter">
            <Form.Label>Filtra per Nome Utente</Form.Label>
            <Form.Control
              type="text"
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
            />
          </Form.Group>
        </Form.Group>
      </div>
      {prenotazioni.length < 1 ? (
        <div>Loading...</div>
      ) : (
        <div>
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
              {currentPrenotazioni.map(prenotazione => (
                <tr key={prenotazione.id}>
                  <td>{isMobile ? <a href={`https://www.instagram.com/${prenotazione.nomeUtente}`}><i class="fa fa-instagram"></i> {prenotazione.nomeUtente}</a> : <a href={`https://www.instagram.com/${prenotazione.nomeUtente}`}>{prenotazione.nomeUtente}</a>}</td>
                  <td>{isMobile ? <div><i class="fa fa-phone"></i>{prenotazione.telefono}</div> : prenotazione.telefono}</td>
                  {!isMobile && <td>{prenotazione.services && prenotazione?.services.map((servi) => <p>{servi}</p>)}</td>}
                  {!isMobile && <td>
                    Fine: {prenotazione.inizio.toDate().toLocaleDateString('it-IT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) + " ore " +
                      prenotazione.inizio.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </td>}
                  {!isMobile && <td><p>
                    Fine: {prenotazione.fine.toDate().toLocaleDateString('it-IT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) + " ore " +
                      prenotazione.fine.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </p></td>}
                  {!isMobile && <td>{prenotazione.studio}</td>}
                  {!isMobile && <td>{findFonico(prenotazione.fonico)}</td>}
                  <td className={`actions h-100  ${isMobile ? 'd-flex flex-column' : 'd-flex flex-column'} justify-content-center`}>
                    <Button className="p-1" variant="primary" onClick={() => handleView(prenotazione)}>Visualizza</Button>
                    <Button variant="danger" className="p-1" onClick={() => handleDelete(prenotazione)}>Elimina</Button>
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
      <BookingModal show={showViewModal} onHide={() => setShowViewModal(false)} prenotazione={selectedPrenotazione} findFonico={findFonico} />
      <ConfirmDeleteModal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} onDelete={confirmDelete} />
    </div>
  );
};

export default Bookings;
