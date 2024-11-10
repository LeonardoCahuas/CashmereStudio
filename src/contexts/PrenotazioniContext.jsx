'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../firebase-config';

const PrenotazioniContext = createContext();

export const PrenotazioniProvider = ({ children }) => {
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [fonici, setFonici] = useState([]);
  const [disponibilitaOre, setDisponibilitaOre] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
        console.log("fetchiiing")
      const prenotazioniQuery = query(collection(db, 'prenotazioni'));
      const foniciQuery = query(collection(db, 'fonici'));
      const disponibilitaQuery = query(collection(db, 'disponibilita'));

      const [prenotazioniSnapshot, foniciSnapshot, disponibilitaSnapshot] = await Promise.all([
        getDocs(prenotazioniQuery),
        getDocs(foniciQuery),
        getDocs(disponibilitaQuery)
      ]);

      const prenotazioniData = prenotazioniSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const foniciData = foniciSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const disponibilitaData = disponibilitaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setPrenotazioni(prenotazioniData);
      setFonici(foniciData);
      setDisponibilitaOre(disponibilitaData);

      localStorage.setItem('prenotazioni', JSON.stringify(prenotazioniData));
      localStorage.setItem('fonici', JSON.stringify(foniciData));
      localStorage.setItem('disponibilita', JSON.stringify(disponibilitaData));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addPrenotazione = async (prenotazione) => {
    try {
      const docRef = await addDoc(collection(db, 'prenotazioni'), prenotazione);
      fetchData()
    } catch (err) {
      setError(err.message);
    }
  };

  const updatePrenotazioneStato = async (id, newStato, fonico) => {
    try {
      const prenotazioneRef = doc(db, 'prenotazioni', id);
      const updateData = fonico ? { stato: newStato, fonico } : { stato: newStato };
      await updateDoc(prenotazioneRef, updateData);

      fetchData()
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminaPrenotazione = async (id) => {
    try {
      await deleteDoc(doc(db, 'prenotazioni', id));
      fetchData()
    } catch (err) {
      setError(err.message);
    }
  };

  const modificaPrenotazione = async (id, updatedPrenotazione) => {
    try {
      await updateDoc(doc(db, 'prenotazioni', id), updatedPrenotazione);
      fetchData()
    } catch (err) {
      setError(err.message);
    }
  };

  const setDisponibilita = async (fonicoId, disponibilita) => {
    try {
      await updateDoc(doc(db, 'fonici', fonicoId), { disp: disponibilita });
      fetchData()
    } catch (err) {
      setError(err.message);
    }
  };

  const setDisponibilita2 = async (fonicoId, disponibilita) => {
    try {
      await updateDoc(doc(db, 'fonici', fonicoId), { disponibilita });
      fetchData()
    } catch (err) {
      setError(err.message);
    }
  };

  const setFerie = async (fonicoId, ferie) => {
    try {
      await updateDoc(doc(db, 'fonici', fonicoId), { ferie });
      fetchData()
    } catch (err) {
      setError(err.message);
    }
  };

  const setNonDisponibilita = async (fonicoId, disponibilita) => {
    try {
      await updateDoc(doc(db, 'fonici', fonicoId), { nondisp: disponibilita });
      fetchData()
    } catch (err) {
      setError(err.message);
    }
  };

  const addFonico = async (fonico) => {
    try {
      const docRef = await addDoc(collection(db, 'fonici'), { nome: fonico, disp: [] });
      fetchData()
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminaFonico = async (id) => {
    try {
      await deleteDoc(doc(db, 'fonici', id));
      fetchData()
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAllPeriodPren = async (uid) => {
    try {
      const prenotazioniToDelete = prenotazioni.filter(prenotazione => prenotazione.period === uid);
      await Promise.all(prenotazioniToDelete.map(prenotazione => deleteDoc(doc(db, 'prenotazioni', prenotazione.id))));
      fetchData()
    } catch (err) {
      setError(err.message);
    }
  };

  const addMultiplePrenotazioni = async (prenotazioniArray) => {
    try {
      const batchAdd = prenotazioniArray.map(prenotazione =>
        addDoc(collection(db, 'prenotazioni'), prenotazione)
      );
      const newPrenotazioniRefs = await Promise.all(batchAdd);
      const newPrenotazioni = newPrenotazioniRefs.map((docRef, index) => ({
        id: docRef.id,
        ...prenotazioniArray[index],
      }));
      setPrenotazioni(prevPrenotazioni => {
        const updatedPrenotazioni = [...prevPrenotazioni, ...newPrenotazioni];
        updateLocalStorage('prenotazioni', updatedPrenotazioni);
        return updatedPrenotazioni;
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const setDisponibilitaPriority = async (ore, foniciOrder) => {
    try {
      const disponibilitaQuery = query(collection(db, 'disponibilita'), where('ore', '==', ore));
      const snapshot = await getDocs(disponibilitaQuery);

      if (snapshot.empty) {
        const newDocRef = await addDoc(collection(db, 'disponibilita'), { ore, fonici: foniciOrder });
        const newDisponibilita = { id: newDocRef.id, ore, fonici: foniciOrder };
        fetchData()
      } else {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, { fonici: foniciOrder });
        fetchData()
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const refreshData = fetchData;

  const contextValue = {
    prenotazioni,
    fonici,
    disponibilitaOre,
    loading,
    error,
    addPrenotazione,
    updatePrenotazioneStato,
    eliminaPrenotazione,
    modificaPrenotazione,
    setDisponibilita,
    setDisponibilita2,
    setFerie,
    setNonDisponibilita,
    addFonico,
    eliminaFonico,
    handleDeleteAllPeriodPren,
    addMultiplePrenotazioni,
    setDisponibilitaPriority,
    refreshData,
  };

  return (
    <PrenotazioniContext.Provider value={contextValue}>
      {children}
    </PrenotazioniContext.Provider>
  );
};

export const usePrenotazioni = () => {
  const context = useContext(PrenotazioniContext);
  if (context === undefined) {
    throw new Error('usePrenotazioni must be used within a PrenotazioniProvider');
  }
  return context;
};

export default usePrenotazioni;