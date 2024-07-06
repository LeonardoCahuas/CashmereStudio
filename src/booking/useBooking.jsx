import { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase-config';

const usePrenotazioni = (selectedDateTime) => {
  const [prenotazioni, setPrenotazioni] = useState([]);
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

    fetchPrenotazioni();
  }, [selectedDateTime]);

  const addPrenotazione = async (prenotazione) => {
    try {
      await addDoc(collection(db, 'prenotazioni'), prenotazione);
    } catch (err) {
      setError(err.message);
    }
  };

  const updatePrenotazioneStato = async (id, newStato) => {
    try {
      const prenotazioneRef = doc(db, 'prenotazioni', id);
      await updateDoc(prenotazioneRef, {
        stato: newStato
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

  return { prenotazioni, loading, error, addPrenotazione, setPrenotazioni,  updatePrenotazioneStato};
};

export default usePrenotazioni;
