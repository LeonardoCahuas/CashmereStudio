import { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

const usePrenotazioni = (selectedDateTime) => {
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [fonici, setFonici] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [change, setChange] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const prenotazioniQuery = query(collection(db, 'prenotazioni'));
        const foniciQuery = query(collection(db, 'fonici'));

        const [prenotazioniSnapshot, foniciSnapshot] = await Promise.all([
          getDocs(prenotazioniQuery),
          getDocs(foniciQuery)
        ]);

        const prenotazioniData = prenotazioniSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const foniciData = foniciSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Aggiorniamo i dati nello stato e nel localStorage
        setPrenotazioni(prenotazioniData);
        setFonici(foniciData);

        localStorage.setItem('prenotazioni', JSON.stringify(prenotazioniData));
        localStorage.setItem('fonici', JSON.stringify(foniciData));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDateTime, change]);

  const setNewChange = () => {
    setChange(prevChange => prevChange + 1);
  };

  const updateLocalStorage = (prenotazioniData, foniciData) => {
    if (prenotazioniData) {
      localStorage.setItem('prenotazioni', JSON.stringify(prenotazioniData));
      setPrenotazioni(prenotazioniData);
    }
    if (foniciData) {
      localStorage.setItem('fonici', JSON.stringify(foniciData));
      setFonici(foniciData);
    }
  };

  const addPrenotazione = async (prenotazione) => {
    try {
      const docRef = await addDoc(collection(db, 'prenotazioni'), prenotazione);
      const updatedPrenotazioni = [...prenotazioni, { id: docRef.id, ...prenotazione }];
      updateLocalStorage(updatedPrenotazioni, fonici);
      setNewChange();
    } catch (err) {
      setError(err.message);
    }
  };

  const updatePrenotazioneStato = async (id, newStato, fonico) => {
    try {
      const prenotazioneRef = doc(db, 'prenotazioni', id);
      await updateDoc(prenotazioneRef, { stato: newStato, fonico: fonico });

      const updatedPrenotazioni = prenotazioni.map(prenotazione =>
        prenotazione.id === id ? { ...prenotazione, stato: newStato, fonico: fonico } : prenotazione
      );

      updateLocalStorage(updatedPrenotazioni, fonici);
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminaPrenotazione = async (id) => {
    try {
      const prenotazioneRef = doc(db, 'prenotazioni', id);
      await deleteDoc(prenotazioneRef);
      const updatedPrenotazioni = prenotazioni.filter(prenotazione => prenotazione.id !== id);
      updateLocalStorage(updatedPrenotazioni, fonici);
    } catch (err) {
      setError(err.message);
    }
  };

  const modificaPrenotazione = async (id, updatedPrenotazione) => {
    try {
      const prenotazioneRef = doc(db, 'prenotazioni', id);
      await updateDoc(prenotazioneRef, updatedPrenotazione);
      const updatedPrenotazioni = prenotazioni.map(prenotazione =>
        prenotazione.id === id ? { ...prenotazione, ...updatedPrenotazione } : prenotazione
      );

      updateLocalStorage(updatedPrenotazioni, fonici);
    } catch (err) {
      setError(err.message);
    }
  };

  const setDisponibilita = async (fonicoId, disponibilita) => {
    try {
      const fonicoRef = doc(db, 'fonici', fonicoId);
      await updateDoc(fonicoRef, { disp: disponibilita });

      const updatedFonici = fonici.map(fonico =>
        fonico.id === fonicoId ? { ...fonico, disp: disponibilita } : fonico
      );

      updateLocalStorage(prenotazioni, updatedFonici);
    } catch (err) {
      setError(err.message);
    }
  };

  const addFonico = async (fonico) => {
    try {
      const docRef = await addDoc(collection(db, 'fonici'), { nome: fonico, disp: [] });
      const updatedFonici = [...fonici, { id: docRef.id, nome: fonico }];
      updateLocalStorage(prenotazioni, updatedFonici);
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminaFonico = async (id) => {
    try {
      const fonicoRef = doc(db, 'fonici', id);
      await deleteDoc(fonicoRef);
      const updatedFonici = fonici.filter(fonico => fonico.id !== id);
      updateLocalStorage(prenotazioni, updatedFonici);
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    prenotazioni,
    fonici,
    loading,
    error,
    addPrenotazione,
    setPrenotazioni,
    updatePrenotazioneStato,
    eliminaPrenotazione,
    modificaPrenotazione,
    setDisponibilita,
    addFonico,
    eliminaFonico,
    setNewChange
  };
};

export default usePrenotazioni;
