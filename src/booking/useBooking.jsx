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
    setChange(0)
  }, [selectedDateTime, change]);


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
      
      // Usa la funzione updater per garantire che React aggiorni correttamente lo stato
      setPrenotazioni(prevPrenotazioni => [
        ...prevPrenotazioni, 
        { id: docRef.id, ...prenotazione }
      ]);
  
      // Aggiorna localStorage usando il valore passato direttamente
      updateLocalStorage([...prenotazioni, { id: docRef.id, ...prenotazione }], fonici);
      setChange(1)
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

  const setNonDisponibilita = async (fonicoId, disponibilita) => {
    try {
      const fonicoRef = doc(db, 'fonici', fonicoId);
      await updateDoc(fonicoRef, { nondisp: disponibilita });

      const updatedFonici = fonici.map(fonico =>
        fonico.id === fonicoId ? { ...fonico, nondisp: disponibilita } : fonico
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

  const handleDeleteAllPeriodPren = async (uid) => {
    try {
      // Filtra le prenotazioni che hanno il period uguale a uid
      const prenotazioniToDelete = prenotazioni.filter(prenotazione => prenotazione.period === uid);

      // Elimina ogni prenotazione filtrata
      await Promise.all(prenotazioniToDelete.map(prenotazione => eliminaPrenotazione(prenotazione.id)));

      // Aggiorna lo stato delle prenotazioni
      const updatedPrenotazioni = prenotazioni.filter(prenotazione => prenotazione.period !== uid);
      updateLocalStorage(updatedPrenotazioni, fonici);
    } catch (err) {
      setError(err.message);
    }


  }

  const addMultiplePrenotazioni = async (prenotazioniArray) => {
    try {
      // Usa Promise.all per inserire tutte le prenotazioni contemporaneamente
      const batchAdd = prenotazioniArray.map(prenotazione =>
        addDoc(collection(db, 'prenotazioni'), prenotazione)
      );

      const newPrenotazioniRefs = await Promise.all(batchAdd);

      // Una volta inserite, aggiungi le nuove prenotazioni con gli ID ottenuti dal database
      const newPrenotazioni = newPrenotazioniRefs.map((docRef, index) => ({
        id: docRef.id,
        ...prenotazioniArray[index],
      }));

      // Usa la funzione updater di setPrenotazioni per garantire che React gestisca correttamente lo stato
      setPrenotazioni(prevPrenotazioni => [...prevPrenotazioni, ...newPrenotazioni]);

      // Aggiorna il localStorage con il nuovo stato aggiornato
      updateLocalStorage([...prenotazioni, ...newPrenotazioni], fonici);
      setChange(1)
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
    setNonDisponibilita,
    addFonico,
    eliminaFonico,
    setChange,
    handleDeleteAllPeriodPren,
    addMultiplePrenotazioni
  };
};

export default usePrenotazioni;
