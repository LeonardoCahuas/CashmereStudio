import React, { useState } from 'react';
import usePrenotazioni from '../../booking/useBooking';
import { Modal, Button, Table, Pagination, Form, Row, Col, Card, Container, ListGroup } from 'react-bootstrap';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import FonicoCalendar from '../FonicoCalendar/FonicoCalendar';

const calcolaOre = (inizio, fine) => {
  if (!inizio || !fine) return 0;
  const inizioDate = inizio.toDate();
  const fineDate = fine.toDate();
  const differenzaMs = fineDate - inizioDate;
  return differenzaMs / (1000 * 60 * 60);
};

const Bookings = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrenotazione, setSelectedPrenotazione] = useState(null);
  const [selectedStudio, setSelectedStudio] = useState('');
  const [usernameFilter, setUsernameFilter] = useState('');
  const [selectedFonico, setSelectedFonico] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [statSelectedFonico, setStatSelectedFonico] = useState('');
  const [statSelectedMonth, setStatSelectedMonth] = useState('');
  const { prenotazioni, setPrenotazioni, fonici, addFonico, eliminaFonico } = usePrenotazioni();
  const prenotazioniPerPage = 10;
  const [showInput, setShowInput] = useState(false);
const [newFonicoName, setNewFonicoName] = useState('');

  // Calcolo delle ore totali
  const calcolaTotaleOre = (prenotazioni) => {
    return prenotazioni.reduce((total, prenotazione) => total + calcolaOre(prenotazione.inizio, prenotazione.fine), 0);
  };

  // Calcolo delle ore totali per mese
  const orePerMese = prenotazioni.reduce((acc, prenotazione) => {
    const mese = prenotazione.inizio.toDate().toLocaleString('it-IT', { month: 'long', year: 'numeric' });
    const ore = calcolaOre(prenotazione.inizio, prenotazione.fine);
    if (!acc[mese]) acc[mese] = 0;
    acc[mese] += ore;
    return acc;
  }, {});

  // Calcolo delle ore per fonico per mese
  const orePerFonicoPerMese = fonici.map(fonico => {
    const orePerMese = prenotazioni.reduce((acc, prenotazione) => {
      if (prenotazione.fonico === fonico.id) {
        const mese = prenotazione.inizio.toDate().toLocaleString('it-IT', { month: 'long', year: 'numeric' });
        const ore = calcolaOre(prenotazione.inizio, prenotazione.fine);
        if (!acc[mese]) acc[mese] = 0;
        acc[mese] += ore;
      }
      return acc;
    }, {});
    return {
      fonico: fonico.nome,
      orePerMese: orePerMese,
    };
  });

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

  // Filtraggio delle prenotazioni per la lista
  const filteredPrenotazioni = prenotazioni.filter(p => {
    const matchesFonico = selectedFonico ? p.fonico === selectedFonico : true;
    const matchesUsername = usernameFilter ? p.nomeUtente.toLowerCase().includes(usernameFilter.toLowerCase()) : true;
    const matchesMonth = selectedMonth ? p.inizio.toDate().toLocaleString('it-IT', { month: 'long', year: 'numeric' }) === selectedMonth : true;
    return matchesFonico && matchesUsername && matchesMonth;
  });

  // Filtraggio delle prenotazioni per le statistiche
  const filteredStatPrenotazioni = prenotazioni.filter(p => {
    const matchesFonico = statSelectedFonico ? p.fonico === statSelectedFonico : true;
    const matchesMonth = statSelectedMonth ? p.inizio.toDate().toLocaleString('it-IT', { month: 'long', year: 'numeric' }) === statSelectedMonth : true;
    return matchesFonico && matchesMonth;
  });

  const currentPrenotazioni = filteredPrenotazioni.slice((currentPage - 1) * prenotazioniPerPage, currentPage * prenotazioniPerPage);
  const totalPages = Math.ceil(filteredPrenotazioni.length / prenotazioniPerPage);

  // Calcolo delle ore totali per le statistiche filtrate
  const calcolaTotaleOreStat = (prenotazioni) => {
    return prenotazioni.reduce((total, prenotazione) => total + calcolaOre(prenotazione.inizio, prenotazione.fine), 0);
  };

  // Calcolo delle ore per fonico per mese per le statistiche filtrate
  const orePerFonicoPerMeseStat = fonici.map(fonico => {
    const orePerMese = filteredStatPrenotazioni.reduce((acc, prenotazione) => {
      if (prenotazione.fonico === fonico.id) {
        const mese = prenotazione.inizio.toDate().toLocaleString('it-IT', { month: 'long', year: 'numeric' });
        const ore = calcolaOre(prenotazione.inizio, prenotazione.fine);
        if (!acc[mese]) acc[mese] = 0;
        acc[mese] += ore;
      }
      return acc;
    }, {});
    return {
      fonico: fonico.nome,
      orePerMese: orePerMese,
    };
  });

  const handleAddFonico = () => {
    addFonico(newFonicoName)
    setShowInput(false)
};

const handleDeleteFonico = (id) => {
    eliminaFonico(id)
};




  return (
    <div style={{ marginTop: '20px', margin: '0px', width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Gestione Prenotazioni</h3>
      <div className='w-100 d-flex flex-row'>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px', width:"50%" }}>
          <h4>Gestione Fonici</h4>
          <Button variant="primary" onClick={() => setShowInput(true)}>Aggiungi Fonico</Button>
          {showInput && (
            <div style={{ marginTop: '10px' }}>
              <Form.Control
                type="text"
                placeholder="Nome del Fonico"
                value={newFonicoName}
                onChange={(e) => setNewFonicoName(e.target.value)}
                style={{ marginBottom: '10px' }}
              />
              <Button variant="success" onClick={handleAddFonico}>Aggiungi</Button>
            </div>
          )}
          <ListGroup style={{ marginTop: '10px' }}>
            {fonici.map(fonico => (
              <ListGroup.Item key={fonico.id}>
                {fonico.nome}
                <Button variant="danger" style={{ float: 'right' }} onClick={() => handleDeleteFonico(fonico.id)}>Rimuovi</Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>

        <Row className="statistics mb-4 w-100 d-flex flex-column align-items-center w-50" style={{ justifyContent: 'space-between' }}>
          <Col xs={12} md={4}>
            <div style={{ padding: '20px', marginBottom: '20px', backgroundColor: '#f0f0f0', borderRadius: '10px' }}>
              <h4>Statistiche Generali</h4>
              <Form.Group controlId="statSelectedFonico" style={{ marginTop: '10px' }}>
                <Form.Label>Filtra per Fonico</Form.Label>
                <Form.Control as="select" value={statSelectedFonico} onChange={(e) => setStatSelectedFonico(e.target.value)} style={{ marginBottom: '10px', borderRadius: '5px' }}>
                  <option value="">Tutti i Fonici</option>
                  {fonici.map(fonico => (
                    <option key={fonico.id} value={fonico.id}>{fonico.nome}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="statSelectedMonth" style={{ marginTop: '10px' }}>
                <Form.Label>Filtra per Mese</Form.Label>
                <Form.Control as="select" value={statSelectedMonth} onChange={(e) => setStatSelectedMonth(e.target.value)} style={{ marginBottom: '10px', borderRadius: '5px' }}>
                  <option value="">Tutti i Mesi</option>
                  {Object.keys(orePerMese).map((mese, index) => (
                    <option key={index} value={mese}>{mese}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <div style={{ marginTop: '20px' }}>
                <div style={{ padding: '10px', backgroundColor: '#e9ecef', borderRadius: '5px', marginBottom: '10px' }}>
                  <strong>Ore Totali:</strong> {calcolaTotaleOreStat(filteredStatPrenotazioni)} ore
                </div>
                {orePerFonicoPerMeseStat.map((item, index) => (
                  <div key={index} style={{ padding: '10px', backgroundColor: '#e9ecef', borderRadius: '5px', marginBottom: '10px' }}>
                    <strong>{item.fonico}:</strong> {Object.entries(item.orePerMese).map(([mese, ore], i) => (
                      <div key={i}>{mese}: {ore} ore</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </div>
      <Row className='w-100'>
        <Col xs={12}>
          <div style={{ padding: '20px', marginBottom: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
            <h4>Elenco Prenotazioni</h4>
            <Form style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <Form.Group controlId="selectedFonico" style={{ flex: '1', marginRight: '10px' }}>
                <Form.Label>Filtra per Fonico</Form.Label>
                <Form.Control as="select" value={selectedFonico} onChange={(e) => setSelectedFonico(e.target.value)} style={{ borderRadius: '5px' }}>
                  <option value="">Tutti i Fonici</option>
                  {fonici.map(fonico => (
                    <option key={fonico.id} value={fonico.id}>{fonico.nome}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="usernameFilter" style={{ flex: '1', marginRight: '10px' }}>
                <Form.Label>Filtra per Nome Utente</Form.Label>
                <Form.Control type="text" placeholder="Nome utente" value={usernameFilter} onChange={(e) => setUsernameFilter(e.target.value)} style={{ borderRadius: '5px' }} />
              </Form.Group>
              <Form.Group controlId="selectedMonth" style={{ flex: '1' }}>
                <Form.Label>Filtra per Mese</Form.Label>
                <Form.Control as="select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ borderRadius: '5px' }}>
                  <option value="">Tutti i Mesi</option>
                  {Object.keys(orePerMese).map((mese, index) => (
                    <option key={index} value={mese}>{mese}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Form>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Studio</th>
                  <th>Nome Utente</th>
                  <th>Fonico</th>
                  <th>Ore Totali</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {currentPrenotazioni.map((prenotazione) => (
                  <tr key={prenotazione.id}>
                    <td>{prenotazione.inizio.toDate().toLocaleString()}</td>
                    <td>{prenotazione.studio}</td>
                    <td>{prenotazione.nomeUtente}</td>
                    <td>{fonici.find(f => f.id === prenotazione.fonico)?.nome}</td>
                    <td>{calcolaOre(prenotazione.inizio, prenotazione.fine)}</td>
                    <td>
                      <Button variant="primary" onClick={() => handleView(prenotazione)} style={{ marginRight: '5px' }}>Vedi</Button>
                      <Button variant="danger" onClick={() => handleDelete(prenotazione)}>Elimina</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination className="justify-content-center" style={{ marginTop: '20px' }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        </Col>
      </Row>
      <FonicoCalendar />

      <BookingModal show={showViewModal} onHide={() => setShowViewModal(false)} prenotazione={selectedPrenotazione} />
      <ConfirmDeleteModal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} onDelete={confirmDelete} />
    </div>
  );
};

const BookingModal = ({ show, onHide, prenotazione }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Dettagli Prenotazione</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {prenotazione && (
        <Container>
          <Row><Col><strong>Nome Utente:</strong> {prenotazione.nomeUtente}</Col></Row>
          <Row><Col><strong>Email:</strong> {prenotazione.email}</Col></Row>
          <Row><Col><strong>Telefono:</strong> {prenotazione.telefono}</Col></Row>
          <Row><Col><strong>Servizi:</strong> {prenotazione.services?.join(', ')}</Col></Row>
          <Row><Col><strong>Inizio:</strong> {prenotazione.inizio.toDate().toLocaleString()}</Col></Row>
          <Row><Col><strong>Fine:</strong> {prenotazione.fine.toDate().toLocaleString()}</Col></Row>
          <Row><Col><strong>Studio:</strong> {prenotazione.studio}</Col></Row>
          <Row><Col><strong>Fonico:</strong> {prenotazione.fonico}</Col></Row>
          <Row><Col><strong>Ore Totali:</strong> {calcolaOre(prenotazione.inizio, prenotazione.fine)} ore</Col></Row>
        </Container>
      )}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>Chiudi</Button>
    </Modal.Footer>
  </Modal>
);

const ConfirmDeleteModal = ({ show, onHide, onDelete }) => (
  <Modal show={show} onHide={onHide} centered>
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

export default Bookings;
