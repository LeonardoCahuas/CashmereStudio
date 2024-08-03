import { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

const usePrenotazioni = (selectedDateTime) => {
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [fonici, setFonici] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrenotazioni = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'prenotazioni')
        );
        const querySnapshot = await getDocs(q);
        const prenotazioniData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPrenotazioni(prenotazioniData);
      } catch (err) {
        console.log(err)
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchFonici = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'fonici')
        );
        const querySnapshot = await getDocs(q);
        const foniciData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFonici(foniciData);
      } catch (err) {
        console.log(err)
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrenotazioni();
    fetchFonici()
  }, [selectedDateTime]);

  const addPrenotazione = async (prenotazione) => {
    try {
      await addDoc(collection(db, 'prenotazioni'), prenotazione);
      console.log("pren aggiunta con successo")
    } catch (err) {
      console.log(err.message)
      setError(err.message);
    }
  };

  const updatePrenotazioneStato = async (id, newStato, fonico) => {
    try {
      const prenotazioneRef = doc(db, 'prenotazioni', id);
      await updateDoc(prenotazioneRef, {
        stato: newStato,
        fonico: fonico
      });
      // Aggiorna lo stato locale
      setPrenotazioni(prevPrenotazioni =>
        prevPrenotazioni.map(prenotazione =>
          prenotazione.id === id ? { ...prenotazione, stato: newStato } : prenotazione
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminaPrenotazione = async (id) => {
    try {
      const prenotazioneRef = doc(db, 'prenotazioni', id);
      await deleteDoc(prenotazioneRef);
      setPrenotazioni(prevPrenotazioni =>
        prevPrenotazioni.filter(prenotazione => prenotazione.id !== id)
      );

      console.log("fatto")
    } catch (err) {
      console.log(err.message)
      setError(err.message);
    }
  };

  const handleSaveChanges = () => {
    console.log('Modifiche salvate');
    setIsEditing(false);
  };

  // Funzione per modificare una prenotazione
  const modificaPrenotazione = async (id, updatedPrenotazione) => {
    try {
      const prenotazioneRef = doc(db, 'prenotazioni', id);
      await updateDoc(prenotazioneRef, updatedPrenotazione);
      setPrenotazioni(prevPrenotazioni =>
        prevPrenotazioni.map(prenotazione =>
          prenotazione.id === id ? { ...prenotazione, ...updatedPrenotazione } : prenotazione
        )
      );

      console.log("done that")
    } catch (err) {
      setError(err.message);
    }
  };

  const setDisponibilita = async (fonicoId, disponibilita) => {
    try {
      // Aggiorna lo stato locale
      setFonici((prevFonici) =>
        prevFonici.map(fonico =>
          fonico.id === fonicoId
            ? { ...fonico, disp: disponibilita }
            : fonico
        )
      );
  
      // Aggiorna il database
      const fonicoRef = doc(db, 'fonici', fonicoId);
      await updateDoc(fonicoRef, {
        disp: disponibilita
      });
  
      console.log("Disponibilità aggiornata per il fonico con ID:", fonicoId);
    } catch (err) {
      console.error("Errore durante l'aggiornamento della disponibilità:", err.message);
    }
  };


  return { prenotazioni, loading, error, addPrenotazione, setPrenotazioni, updatePrenotazioneStato, fonici, eliminaPrenotazione, modificaPrenotazione, setDisponibilita };
};

export default usePrenotazioni;
