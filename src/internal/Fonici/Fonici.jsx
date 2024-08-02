import React, { useState, useEffect } from 'react';
import usePrenotazioni from '../../booking/useBooking';
import { Modal, Button, Table, Pagination, Form, Row, Col, Card, Container } from 'react-bootstrap';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase-config';

const calcolaOre = (inizio, fine) => {
  if (!inizio || !fine) return 0;
  const inizioDate = inizio.toDate();
  const fineDate = fine.toDate();
  const differenzaMs = fineDate - inizioDate;
  return differenzaMs / (1000 * 60 * 60);
};


const calcolaOrePerFonico = (prenotazioni, fonici) => {
  return fonici.map(fonico => {
    const prenotazioniFonico = prenotazioni.filter(p => p.fonico === fonico.id);
    return {
      fonico: fonico.nome,
      ore: calcolaTotaleOre(prenotazioniFonico),
    };
  });
};

const calcolaOrePerMese = (prenotazioni) => {
  return prenotazioni.reduce((acc, prenotazione) => {
    const mese = prenotazione.inizio.toDate().toLocaleString('it-IT', { month: 'long', year: 'numeric' });
    const ore = calcolaOre(prenotazione.inizio, prenotazione.fine);
    if (!acc[mese]) acc[mese] = 0;
    acc[mese] += ore;
    return acc;
  }, {});
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

const Bookings = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrenotazione, setSelectedPrenotazione] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedStudio, setSelectedStudio] = useState('');
  const [usernameFilter, setUsernameFilter] = useState('');
  const [selectedFonico, setSelectedFonico] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const { prenotazioni, setPrenotazioni, fonici } = usePrenotazioni();
  const prenotazioniPerPage = 10;

  // Calcolo delle ore totali
  const calcolaTotaleOre = (prenotazioni) => {
    return prenotazioni.reduce((total, prenotazione) => total + calcolaOre(prenotazione.inizio, prenotazione.fine), 0);
  };

  // Calcolo delle ore totali per fonico
  const orePerFonico = fonici.map(fonico => {
    const prenotazioniFonico = prenotazioni.filter(p => p.fonico === fonico.id);
    return {
      fonico: fonico.nome,
      ore: calcolaTotaleOre(prenotazioniFonico),
    };
  });

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

  // Filtraggio delle prenotazioni
  const filteredPrenotazioni = prenotazioni.filter(p => {
    const matchesFonico = selectedFonico ? p.fonico === selectedFonico : true;
    const matchesUsername = usernameFilter ? p.nomeUtente.toLowerCase().includes(usernameFilter.toLowerCase()) : true;
    return matchesFonico && matchesUsername;
  });

  const currentPrenotazioni = filteredPrenotazioni.slice((currentPage - 1) * prenotazioniPerPage, currentPage * prenotazioniPerPage);
  const totalPages = Math.ceil(filteredPrenotazioni.length / prenotazioniPerPage);

  return (
    <Container className="bookings-container">
      <h3 className="text-center my-4">Gestione Prenotazioni</h3>
      <Row className="controls mb-4">
        <Col>
          <Form.Group controlId="sortOrder">
            <Form.Label>Ordina per Data</Form.Label>
            <Form.Control as="select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="selectedFonico">
            <Form.Label>Filtra per Fonico</Form.Label>
            <Form.Control as="select" value={selectedFonico} onChange={(e) => setSelectedFonico(e.target.value)}>
              <option value="">Tutti i Fonici</option>
              {fonici.map(fonico => (
                <option key={fonico.id} value={fonico.id}>{fonico.nome}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="usernameFilter">
            <Form.Label>Filtra per Nome Utente</Form.Label>
            <Form.Control
              type="text"
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="selectedMonth">
            <Form.Label>Filtra per Mese</Form.Label>
            <Form.Control as="select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              <option value="">Tutti i Mesi</option>
              {Object.keys(orePerMese).map((mese, index) => (
                <option key={index} value={mese}>{mese}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      <Row className="statistics mb-4">
        <Col>
          <Card>
            <Card.Body>
              <h3>Statistiche Generali</h3>
              <Card.Text>
                <strong>Ore Totali:</strong> {calcolaTotaleOre(prenotazioni)} ore
              </Card.Text>
              <Card.Text>
                <strong>Ore per Fonico:</strong>
                <ul>
                  {orePerFonico.map((item, index) => (
                    <li key={index}>{item.fonico}: {item.ore} ore</li>
                  ))}
                </ul>
              </Card.Text>
              <Card.Text>
                <strong>Ore per Mese:</strong>
                <ul>
                  {Object.entries(orePerMese).map(([mese, ore], index) => (
                    <li key={index}>{mese}: {ore} ore</li>
                  ))}
                </ul>
              </Card.Text>
              <Card.Text>
                <strong>Ore per Fonico per Mese:</strong>
                <ul>
                  {orePerFonicoPerMese.map((item, index) => (
                    <li key={index}>
                      {item.fonico}: 
                      <ul>
                        {Object.entries(item.orePerMese).map(([mese, ore], idx) => (
                          <li key={idx}>{mese}: {ore} ore</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Ore per Fonico</Card.Title>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Fonico</th>
                    <th>Ore Totali</th>
                    <th>Utenti</th>
                  </tr>
                </thead>
                <tbody>
                  {orePerFonico.map((item, index) => (
                    <tr key={index}>
                      <td>{item.fonico}</td>
                      <td>{item.ore} ore</td>
                      <td>{[...new Set(prenotazioni.filter(p => p.fonico === item.fonico).map(p => p.nomeUtente))].join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Data</th>
                <th>Studio</th>
                <th>Nome Utente</th>
                <th>Fonico</th>
                <th>Ore</th>
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
                    <Button variant="primary" onClick={() => handleView(prenotazione)}>Vedi</Button>
                    <Button variant="danger" onClick={() => handleDelete(prenotazione)}>Elimina</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination className="justify-content-center">
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </Col>
      </Row>

      <BookingModal show={showViewModal} onHide={() => setShowViewModal(false)} prenotazione={selectedPrenotazione} />
      <ConfirmDeleteModal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} onDelete={confirmDelete} />
    </Container>
  );
};

export default Bookings;
