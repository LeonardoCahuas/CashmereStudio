import React, { useState, useEffect } from 'react';
import usePrenotazioni from '../../contexts/PrenotazioniContext';
import './Search.css';

const giorniSettimana = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const daysCode = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const getFormattedDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatHour = (hour) => {
  if (hour >= 24) {
    return String(hour - 24).padStart(2, '0');
  }
  return String(hour).padStart(2, '0');
};

const isHourInFonicoAvailability = (hour, disponibilita, dayOfWeek) => {
  return disponibilita.some(d => {
    const [day, startStr, endStr] = d.split('-');
    if (day !== dayOfWeek) return false;
    
    let startHour = parseInt(startStr, 10);
    let endHour = parseInt(endStr, 10);
    
    // Normalizza l'ora da controllare per il confronto
    let checkHour = hour;
    if (checkHour < 10) { // Se l'ora è dopo mezzanotte
      checkHour += 24;
    }
    
    // Se l'ora di fine è minore dell'ora di inizio, significa che va oltre mezzanotte
    if (endHour < startHour) {
      endHour += 24;
    }
    
    return checkHour >= startHour && checkHour < endHour;
  });
};

const Search = () => {
  const [selectedStudio, setSelectedStudio] = useState('');
  const [selectedFonico, setSelectedFonico] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const { prenotazioni, fonici } = usePrenotazioni();

  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return getFormattedDate(date);
  });

  const getTimeRanges = (slots) => {
    const ranges = [];
    let start = null;
    let end = null;

    for (let i = 0; i < slots.length; i++) {
      const currentHour = parseInt(slots[i].split(':')[0], 10);
      if (start === null) {
        start = currentHour;
        end = currentHour;
      } else if (currentHour === end + 1 || (end === 23 && currentHour === 0)) {
        end = currentHour;
      } else {
        ranges.push(`${formatHour(start)}:00-${formatHour((end + 1) % 24)}:00`);
        start = currentHour;
        end = currentHour;
      }
    }

    if (start !== null) {
      ranges.push(`${formatHour(start)}:00-${formatHour((end + 1) % 24)}:00`);
    }

    return ranges;
  };

  useEffect(() => {
    const filteredSlots = next7Days.map(date => {
      const currentDate = new Date(date);
      const dayOfWeek = daysCode[currentDate.getDay()];

      // Studio base hours (10:00-04:00)
      // Genera le ore da 10 a 28 (04:00 del giorno dopo)
      let studioHours = Array.from({ length: 19 }, (_, i) => (i + 10));
      let fonicoHours = [...studioHours];

      // Get studio occupied slots
      if (selectedStudio) {
        const studioOccupiedSlots = new Set();
        prenotazioni
          .filter(p => {
            const prenStartDate = getFormattedDate(p.inizio.toDate());
            return prenStartDate === date && p.stato === 2 && p.studio === parseInt(selectedStudio);
          })
          .forEach(p => {
            let startHour = p.inizio.toDate().getHours();
            let endHour = p.fine.toDate().getHours();
            
            if (endHour <= startHour) {
              endHour += 24;
            }
            
            for (let h = startHour; h < endHour; h++) {
              studioOccupiedSlots.add(h);
            }
          });

        studioHours = studioHours.filter(hour => !studioOccupiedSlots.has(hour));
      }

      // Get fonico availability and occupied slots
      if (selectedFonico) {
        const selectedFonicoData = fonici.find(f => f.id === selectedFonico);
        
        // Check holidays
        const isInFerie = selectedFonicoData?.ferie?.some(ferieDate => 
          new Date(ferieDate).toLocaleDateString() === currentDate.toLocaleDateString()
        );

        if (isInFerie) {
          fonicoHours = [];
        } else {
          // Filter by availability schedule
          fonicoHours = fonicoHours.filter(hour => 
            isHourInFonicoAvailability(hour % 24, selectedFonicoData.disponibilita, dayOfWeek)
          );

          // Filter by fonico bookings
          const fonicoOccupiedSlots = new Set();
          prenotazioni
            .filter(p => {
              const prenStartDate = getFormattedDate(p.inizio.toDate());
              return prenStartDate === date && p.stato === 2 && p.fonico === selectedFonico;
            })
            .forEach(p => {
              let startHour = p.inizio.toDate().getHours();
              let endHour = p.fine.toDate().getHours();
              
              if (endHour <= startHour) {
                endHour += 24;
              }
              
              for (let h = startHour; h < endHour; h++) {
                fonicoOccupiedSlots.add(h);
              }
            });

          fonicoHours = fonicoHours.filter(hour => !fonicoOccupiedSlots.has(hour));
        }
      }

      // Intersect available hours if both filters are active
      let availableHours = selectedStudio && selectedFonico ? 
        studioHours.filter(hour => fonicoHours.includes(hour)) :
        selectedStudio ? studioHours : fonicoHours;

      // Convert to slots format, ensuring proper handling of hours > 24
      const availableDaySlots = availableHours
        .map(hour => `${formatHour(hour % 24)}:00`);

      return { 
        date, 
        slots: getTimeRanges(availableDaySlots)
      };
    });

    setAvailableSlots(filteredSlots);
  }, [selectedStudio, selectedFonico, prenotazioni, fonici]);

  return (
    <div className="studio-availability-filter">
      <h2>Disponibilita di studi e fonici</h2>
      <div className="filter-controls">
        <select 
          value={selectedStudio} 
          onChange={(e) => setSelectedStudio(e.target.value)}
        >
          <option value="">Select Studio</option>
          <option value="1">Studio 1</option>
          <option value="2">Studio 2</option>
          <option value="3">Studio 3</option>
          <option value="4">Studio 4</option>
        </select>
        <select 
          value={selectedFonico} 
          onChange={(e) => setSelectedFonico(e.target.value)}
        >
          <option value="">Select Sound Engineer</option>
          {fonici.map(fonico => (
            <option key={fonico.id} value={fonico.id}>{fonico.nome}</option>
          ))}
        </select>
      </div>
      <table className="availability-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Available Slots</th>
          </tr>
        </thead>
        <tbody>
          {availableSlots.map(({ date, slots }) => (
            <tr key={date}>
              <td>{`${giorniSettimana[new Date(date).getDay()]} ${new Date(date).getDate()}/${new Date(date).getMonth() + 1}`}</td>
              <td>{slots.join(', ') || 'No available slots'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Search;

