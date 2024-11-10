import React, { useState, useEffect } from 'react';
import usePrenotazioni from '../../contexts/PrenotazioniContext';
import { Modal, Button, Table, Pagination, Form } from 'react-bootstrap';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import './Bookings.css'; // Import del file CSS

const calcolaOre = (inizio, fine) => {
  if (!inizio || !fine) return 0;
  const inizioDate = inizio.toDate();
  const fineDate = fine.toDate();

  const differenzaMs = fineDate - inizioDate;
  return fineDate < inizioDate ? differenzaMs / (1000 * 60 * 60) + 24 : differenzaMs / (1000 * 60 * 60);
};

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
          <p>Note: {prenotazione.note ? prenotazione.note : ""}</p>
          <p>Prenotato da: {prenotazione.prenotatoDa}</p>
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
  const [selectedFonico, setSelectedFonico] = useState(null);
  const { prenotazioni, loading, error, setPrenotazioni, fonici } = usePrenotazioni(new Date());
  const prenotazioniPerPage = 10;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
  const [oreTot, setOreTot] = useState({});
  const [filteredPrenotazioni, setFilteredPrenotazioni] = useState([]);
  const [length, setSength] = useState(0)

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

  useEffect(() => {
    // Calcola le ore totali per ogni utente
    const calculateOreTot = () => {
      let oreTotLocal = {};
      prenotazioni.forEach((p) => {
        const ore = calcolaOre(p.inizio, p.fine);
        oreTotLocal[p.nomeUtente] = (oreTotLocal[p.nomeUtente] || 0) + ore;
      });
      setOreTot(oreTotLocal);
    };

    calculateOreTot();
  }, [prenotazioni]);

  useEffect(() => {
    // Filtra le prenotazioni basate sui criteri selezionati
    const applyFilters = () => {
      const sortedPrenotazioni = prenotazioni.sort((a, b) => {
        const dateA = a.inizio.toDate();
        const dateB = b.inizio.toDate();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });

      const filtered = sortedPrenotazioni.filter(p => {
        const matchesDate = selectedDate ? p.inizio.toDate().toDateString() === new Date(selectedDate).toDateString() : true;
        const matchesStudio = selectedStudio ? p.studio?.toString() === selectedStudio : true;
        const matchesFonico = selectedFonico == "no" ? (findFonico(p.fonico) == "Senza fonico" || findFonico(p.fonico) == "") : selectedFonico ? p.fonico === selectedFonico : true;
        const matchesUsername = usernameFilter ? p.nomeUtente.toLowerCase().includes(usernameFilter.toLowerCase()) : true;
        return matchesDate && matchesStudio && matchesUsername && matchesFonico && p.stato == 2;
      });

      setFilteredPrenotazioni(filtered);
    };



    applyFilters();
  }, [prenotazioni, selectedDate, selectedStudio, usernameFilter, selectedFonico, sortOrder]);

  const handleView = (prenotazione) => {
    setSelectedPrenotazione(prenotazione);
    setShowViewModal(true);
  };

  const findFonico = (id) => {
    const fonico = fonici.find((fon) => fon.id == id);
    return fonico && fonico.nome ? fonico.nome : "";
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

  const currentPrenotazioni = filteredPrenotazioni.slice(indexOfFirstPrenotazione, indexOfLastPrenotazione);
  const totalPages = Math.ceil(filteredPrenotazioni.length / prenotazioniPerPage);

  return (
    <div>
      <div className='d-flex flex-row align-items-center mb-5'>
        <div className='w-25'></div>
        <h3 className="text-center w-50">Prenotazioni</h3>
        <div className='w-25 d-flex flex-row justify-content-end'>
          <p style={{ borderBottom: "1px solid black", width: "fit-content", margin: "0px" }} onClick={() => {
            setSelectedDate('');
            setSelectedFonico('');
            setSelectedStudio('');
            setUsernameFilter('');
          }}>
            Annulla filtri
          </p>
        </div>
      </div>
      <div className="controls">
        <Form.Group controlId="sortOrder">
          <Form.Label style={{ fontWeight: "600" }}>Ordina per Data</Form.Label>
          <Form.Control as="select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Crescente</option>
            <option value="desc">Decrescente</option>
          </Form.Control>
        </Form.Group>
        <br />
        <Form.Group controlId="selectedDate">
          <Form.Label style={{ fontWeight: "600" }}>Filtra per Data</Form.Label>
          <Form.Control
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Form.Group>
        <br />
        <Form.Group controlId="selectedStudio">
          <Form.Label style={{ fontWeight: "600" }}>Filtra per Studio</Form.Label>
          <Form.Control as="select" value={selectedStudio} onChange={(e) => setSelectedStudio(e.target.value)}>
            <option value="">Tutti</option>
            <option value="1">Studio 1</option>
            <option value="2">Studio 2</option>
            <option value="3">Studio 3</option>
          </Form.Control>
          <br />
          <Form.Label style={{ fontWeight: "600" }}>Filtra per fonico</Form.Label>
          <Form.Control as="select" onChange={(e) => setSelectedFonico(e.target.value)} value={selectedFonico}>
            <option value="">tutti</option>
            {fonici.filter(f => f.id != 1).map((fonico) => (
              <option key={fonico.id} value={fonico.id}>
                {fonico.nome}
              </option>
            ))}
            <option key={"no"} value={"no"}>
              Senza fonico
            </option>
          </Form.Control>
          <br />
          <Form.Group controlId="usernameFilter">
            <Form.Label style={{ fontWeight: "600" }}>Filtra per Nome Utente</Form.Label>
            <Form.Control
              type="text"
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
            />
          </Form.Group>
        </Form.Group>
        <br />
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
                <th>Ore Totali</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {currentPrenotazioni.map(prenotazione => (
                <tr key={prenotazione.id}>
                  <td>{isMobile ? <a href={`https://www.instagram.com/${prenotazione.nomeUtente}`}><i className="fa fa-instagram"></i> {prenotazione.nomeUtente}</a> : <a href={`https://www.instagram.com/${prenotazione.nomeUtente}`}>{prenotazione.nomeUtente}</a>}</td>
                  <td>{isMobile ? <div><i className="fa fa-phone"></i>{prenotazione.telefono}</div> : prenotazione.telefono}</td>
                  {!isMobile && <td>{prenotazione.services && prenotazione?.services.map((servi) => <p>{servi}</p>)}</td>}
                  {!isMobile && <td>
                    Inizio: {prenotazione.inizio.toDate().toLocaleDateString('it-IT', {
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
                  <td> {oreTot && oreTot[prenotazione.nomeUtente]} </td>
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
