import React, { useState, useMemo } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import usePrenotazioni from '../../contexts/PrenotazioniContext';
import './Users.css'; // Import the CSS file

const UserBookingsModal = ({ show, onHide, bookings }) => (
  <Modal show={show} onHide={onHide} dialogClassName="custom-modal">
    <Modal.Header closeButton>
      <Modal.Title>Prenotazioni Utente</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {bookings.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nome Utente</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Inizio</th>
              <th>Fine</th>
              <th>Studio</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.nomeUtente}</td>
                <td>{booking.email}</td>
                <td>{booking.telefono}</td>
                <td>{booking.inizio.toDate().toLocaleString()}</td>
                <td>{booking.fine.toDate().toLocaleString()}</td>
                <td>{booking.studio}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>Nessuna prenotazione trovata per questo utente.</p>
      )}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>Chiudi</Button>
    </Modal.Footer>
  </Modal>
);

const Users = () => {
  const [filterType, setFilterType] = useState('nomeUtente');
  const [filterValue, setFilterValue] = useState('');
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const { prenotazioni, loading, error } = usePrenotazioni(new Date());

  const handleFilterChange = (e) => {
    setFilterValue(e.target.value);
  };

  const handleViewBookings = (user) => {
    const userBookings = prenotazioni.filter(booking => booking.nomeUtente === user.nomeUtente);
    setSelectedBookings(userBookings);
    setShowBookingsModal(true);
  };

  const users = useMemo(() => {
    const uniqueUsers = {};
    prenotazioni.forEach(booking => {
      if (!uniqueUsers[booking.nomeUtente]) {
        uniqueUsers[booking.nomeUtente] = {
          nomeUtente: booking.nomeUtente,
          telefono: booking.telefono
        };
      }
    });
    return Object.values(uniqueUsers);
  }, [prenotazioni]);

  const filteredUsers = users.filter(user => {
    if (filterType === 'nomeUtente') {
      return user.nomeUtente?.toLowerCase().includes(filterValue?.toLowerCase());
    } else if (filterType === 'telefono') {
      return user.telefono.includes(filterValue);
    }
    return true;
  });

  return (
    <div className="container">
      <h3 className="mt-3">Utenti</h3>
      <div className="controls">
        <Form.Group controlId="filterType">
          <Form.Label>Filtra per</Form.Label>
          <Form.Control as="select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="nomeUtente">Nome Utente</option>
            <option value="telefono">Telefono</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="filterValue">
          <Form.Label>Valore filtro</Form.Label>
          <Form.Control
            type="text"
            placeholder={`Inserisci ${filterType}`}
            value={filterValue}
            onChange={handleFilterChange}
          />
        </Form.Group>
      </div>
      {prenotazioni.length < 1 ? (
        <div>Loading...</div>
      ) : (
        <Table striped bordered hover className="table-container">
          <thead>
            <tr>
              <th>Nome Utente</th>
              <th>Telefono</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.nomeUtente}>
                <td>{user.nomeUtente}</td>
                <td>{user.telefono}</td>
                <td className="actions">
                  <Button variant="primary" onClick={() => handleViewBookings(user)}>Visualizza Prenotazioni</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <UserBookingsModal
        show={showBookingsModal}
        onHide={() => setShowBookingsModal(false)}
        bookings={selectedBookings}
      />
    </div>
  );
};

export default Users;
