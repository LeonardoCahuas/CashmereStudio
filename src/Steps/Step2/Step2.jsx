import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import usePrenotazioni from '../../contexts/PrenotazioniContext';
import './Step2.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
const months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

const giorniSettimana = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

const getSlotNumber = (hour, dayOffset) => {
  return dayOffset * 18 + (hour - 10) + 1; // Restituisce il numero dello slot
};

const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} slick-next flex-column align-items-center justify-content-center`}
      style={{ ...style, borderRadius: '50%', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", right: "-30px" }}
      onClick={onClick}
    >
      <i class="fa-solid fa-chevron-right" style={{ color: "black", fontSize: "40px", position: "absolute", right: '0px', backgroundColor: "white", width: "40px", height: "40px", borderRadius: "50%" }}></i>
    </div>
  );
};

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} slick-next flex-column align-items-center justify-content-center`}
      style={{ ...style, borderRadius: '50%', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", left: "-0px" }}
      onClick={onClick}
    >
      <i class="fa-solid fa-chevron-left" style={{ color: "black", fontSize: "40px", position: "absolute", right: '0px', backgroundColor: "white", width: "40px", height: "40px", borderRadius: "50%" }}></i>
    </div>
  );
};

const settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
  className: 'custom-slider',
  rows: 1,
  beforeChange: (current, next) => {
    const totalSlides = getMonthDays().filter(day => day).length; // Calcola il numero totale di slot disponibili
    if (next < 0 || next >= 2) return false; // Limita lo scorrimento oltre gli slot disponibili
  }
};

const getFormattedDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonthDays = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  const endDate = new Date(year, month, day + 27); // Data 28 giorni dopo
  const daysInMonth = Math.min(Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)), 28);
  const firstDayOfMonth = today.getDay(); // Ottieni il giorno della settimana del primo giorno del mese
  const days = [];

  for (let i = 0; i < daysInMonth; i++) {
    const date = new Date(year, month, day + i);
    days.push({
      label: `${giorniSettimana[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`,
      date: getFormattedDate(date),
    });
  }

  // Aggiungi giorni vuoti per allineare i giorni correttamente nella settimana
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.unshift(null);
  }

  return days;
};

const Step2 = ({ setBooking, goBack, studio, setStudio, service, selectedFonico }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const { prenotazioni, loading, error, addPrenotazione, fonici } = usePrenotazioni(selectedDay);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [bookingTime, setBookingTime] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 602);
    };

    window.addEventListener('resize', handleResize);
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setSelectedStart(null);
    setSelectedEnd(null);
  }, [selectedDay]);

  useEffect(() => {
    setBookingTime({
      day: selectedDay,
      start: selectedStart,
      end: selectedEnd,
    });
  }, [selectedEnd]);

  const annulla = () => {
    setSelectedStart(null)
    setSelectedEnd(null)
  }

  const handleSlotClick = (startTime, endTime = null) => {
    if (!endTime) {
      const [selectedStartHourPart, selectedStartMinutePart] = selectedStart ? selectedStart.split(':') : [null, null];
      const selectedStartHour = selectedStartHourPart ? parseFloat(selectedStartHourPart) + (selectedStartMinutePart === '30' ? 0.5 : 0) : null;
      const [currentHourPart, currentMinutePart] = startTime.split(':');
      const currentHour = parseFloat(currentHourPart) + (currentMinutePart === '30' ? 0.5 : 0);

      if (!selectedStart || (selectedStart && selectedEnd) || (selectedStart && currentHour < selectedStartHour + 1)) {
        setSelectedStart(startTime);
        setSelectedEnd(null);
      } else if (startTime > selectedStart) {
        setSelectedEnd(startTime);
      } else {
        setSelectedStart(startTime);
        setSelectedEnd(null);
      }
    } else {
      setSelectedStart(startTime);
      setSelectedEnd(endTime);
    }
  };


  const handleNextStep = () => {
    setBooking(bookingTime);
  };

  const renderSlots = () => {
    const daysCode = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const slots = [];
    const selectedDayPrenotazioni = prenotazioni.filter(
      (p) => getFormattedDate(new Date(p.inizio.seconds * 1000)) === selectedDay && p.stato == 2 && (p.studio == studio || (selectedFonico && p.fonico === selectedFonico))
    );
    let occupied = [];

    const isTimeAvailable = (time) => {
      if (!selectedStart) return true;
      const selectedStartHour = parseInt(selectedStart.split(':')[0], 10);
      const currentHour = parseInt(time.split(':')[0], 10);

      if (currentHour <= selectedStartHour) return true;

      for (let hour = selectedStartHour; hour < currentHour; hour++) {
        if (occupied.includes(hour)) return false;
      }
      return true;
    };

    const isEndValid = (time) => {
      if (!selectedStart) return true;
      const selectedStartHour = parseInt(selectedStart.split(':')[0], 10);
      const currentHour = parseInt(time.split(':')[0], 10);

      const isWithinMaxDuration = (currentHour - selectedStartHour) <= 4;
      return currentHour - selectedStartHour >= 1 && isWithinMaxDuration;
    };

    selectedDayPrenotazioni.forEach((p) => {
      const startDate = new Date(p.inizio.seconds * 1000);
      const endDate = new Date(p.fine.seconds * 1000);
      const startHour = startDate.getHours();
      const endHour = endDate.getHours();

      for (let hour = startHour; hour < endHour; hour++) {
        occupied.push(hour);
      }

      if (endHour < startHour) {
        for (let hour = startHour; hour < 24; hour++) {
          occupied.push(hour);
        }
      }
    });

    const fonicoDisponibilita = fonici.find(f => f.id === selectedFonico)?.disp || [];
    const fonicoDisponibilita1 = fonici.find(f => f.id === selectedFonico)?.disponibilita || [];

    // Calcola il giorno della settimana (0 per lunedì, 1 per martedì, ecc.)
    const currentDate = new Date(selectedDay);
    const dayOffset = (currentDate.getDay() + 6) % 7; 

    // Verifica se il fonico è in ferie per questa data
    const isInFerie = selectedFonico && fonici.find(f => f.id === selectedFonico)?.ferie?.some(ferieDate => 
        new Date(ferieDate).toLocaleDateString() === currentDate.toLocaleDateString()
    );

    // Se il fonico è in ferie, marca tutte le ore come occupate
    if (isInFerie) {
        for (let hour = 10; hour < 23; hour++) {
            occupied.push(hour);
        }
    } else {
        // Calcola tutte le ore dalle 10 alle 22
        for (let hour = 10; hour < 23; hour++) {
            const slotNumber = getSlotNumber(hour, dayOffset);
            const isAvailable = fonicoDisponibilita1.some(d => {
                const val = d.split('-');
                return daysCode[currentDate.getDay()] === val[0] && hour >= val[1] && hour < val[2];
            });
            
            // Controlla se l'ora è disponibile
            if (!isAvailable && selectedFonico) {
                occupied.push(hour);
            }
        }
    }

    const isPackageSelected = service && (service.includes("2h + mix&master") || service.includes("2h + mix&master + beat") || service.includes("4h + 2 mix&master"));
    let packageDuration = service && service.includes("4h") ? 4 : 2;
    service.forEach((s) => {
      if (s.includes("4h")) {
        packageDuration = 4
      }
    })
    if (isPackageSelected) {
      for (let hour = 10; hour <= 22 - packageDuration + 1; hour++) {
        const startTime = `${String(hour).padStart(2, '0')}:00`;
        const endTime = `${String(hour + packageDuration).padStart(2, '0')}:00`;

        const isSlotOccupied = Array.from({ length: packageDuration }, (_, i) => hour + i)
          .some(h => occupied.includes(h));

        if (!isSlotOccupied) {
          slots.push(
            <div
              key={startTime}
              className={`slot ${selectedStart === startTime ? 'selected-start' : ''}`}
              onClick={() => {
                handleSlotClick(startTime, endTime)
              }}
            >
              {`${startTime} - ${endTime}`}
            </div>
          );
        }
      }
    } else {
      for (let hour = 10; hour <= 22; hour++) {
        const time = `${String(hour).padStart(2, '0')}:00`;
        const adjustedOccupied = selectedStart ? occupied.map(h => h + 1) : occupied;
        const isOccupied = adjustedOccupied.includes(hour);
        const isSelectedStart = selectedStart === time && selectedEnd;
        const isSelectedStartNot = selectedStart === time && !selectedEnd;
        const isSelectedEnd = selectedEnd === time;
        const isSelectedRange = selectedStart && selectedEnd && hour > parseInt(selectedStart.split(':')[0], 10) && hour < parseInt(selectedEnd.split(':')[0], 10);
        const isClickable = isTimeAvailable(time);
        const canSelectEnd = isEndValid(time);

        const slotClass = isSelectedStart ? 'selected-start-not' :
          isSelectedStartNot ? 'selected-start' :
            isSelectedRange ? 'selected-range' :
              isOccupied ? 'occupied' :
                isSelectedEnd ? 'selected-end' : '';

        const isSlotClickable = ((!selectedStart && !isOccupied) || (selectedStart && (isSelectedStart || (isClickable && canSelectEnd)))) && !isOccupied;

        slots.push(
          <div
            key={time}
            className={`slot ${slotClass}`}
            onClick={() => isSlotClickable && handleSlotClick(time)}
            style={{
              pointerEvents: isSlotClickable ? 'auto' : 'none',
              opacity: isOccupied ? 1 : isSelectedStart ? 1 : isSlotClickable ? 1 : 0.5,
            }}
          >
            {time}
          </div>
        );
      }
    }

    slots.push(
      <div className='slot d-flex flex-row align-items-center justify-content-center ripristina' onClick={() => annulla()} style={{ paddingBottom: "0px", gap: "4px", height: "30px", border: "1px solid black", paddingRight: "15px", paddingLeft: "15px" }}>
        <p className='m-0 p-0'>Ripristina</p>
      </div>
    );
    slots.push(
      <div className='slot d-flex flex-row align-items-center justify-content-center altristu' onClick={() => {
        annulla()
        setStudio(studio == 1 ? 2 : 1)
      }} style={{ paddingBottom: "0px", gap: "4px", height: "30px", border: "1px solid black", paddingRight: "15px", paddingLeft: "15px" }}>
        <p className='m-0 p-0'>{studio == 1 ? "Studio 2" : "Studio 1"}</p>
      </div>
    );
    slots.push(
      <div className='slot d-flex flex-row align-items-center justify-content-center altristu' onClick={() => {
        annulla()
        setStudio(studio == 3 ? 2 : 3)
      }} style={{ paddingBottom: "0px", gap: "4px", height: "30px", border: "1px solid black", paddingRight: "15px", paddingLeft: "15px" }}>
        <p className='m-0 p-0'>{studio == 3 ? "Studio 2" : "Studio 3"}</p>
      </div>
    );

    return slots;
  };

  return (
    <div className="container mt-5 text-start" style={{ paddingBottom: isMobile ? "50px" : "250px" }}>
      <div style={{ paddingLeft: isMobile ? "20px" : "0px" }}>
        <p style={{ textDecoration: "underline", cursor: "pointer", width: "fit-content" }} onClick={() => goBack()}>{"< Indietro"}</p>
        <h2 className="mb-3 text-start fs-1" style={{ fontWeight: '800' }}>
          Data e ora della sessione
        </h2>
        <h6 className="mt-5 fs-5 mb-4">Seleziona data</h6>
      </div>
      <div className="w-100 d-flex flex-row custom-slider-container" style={{ height: '130px' }}>
        <Slider {...settings} className="week-slider custom-slider w-100" style={{ height: '100px', padding: isMobile ? "0px" : '0px', paddingLeft: "30px", paddingRight: "30px" }}>
          {getMonthDays()
            .filter((day) => day)
            .map((day, index) => (
              <div key={index} className="day-slide" style={{ backgroundColor: "transparent" }}>
                <button
                  className={`day-button ${day.date === selectedDay ? 'selected' : ''} d-flex flex-column justify-content-center`}
                  onClick={() => setSelectedDay(day.date)}
                  style={{ width: isMobile ? "130px" : '150px', backgroundColor: "white", border: day.date === selectedDay ? "2px solid #08B1DF" : "2px solid black", color: day.date === selectedDay ? "white" : "black", textAlign: "start", paddingTop: "15px", paddingBottom: "15px", height: "fit-content" }}
                >
                  <p className='text-start w-100 fs-5'>
                    {`${giorniSettimana[new Date(day.date).getDay()]}`}
                  </p>
                  <p className='text-start w-100 fs-6' style={{ fontWeight: 800, marginTop: "-20px", marginBottom: '0px', whiteSpace: "nowrap" }}>
                    {`${new Date(day.date).getDate()} ${months[new Date(day.date).getMonth()]}`}
                  </p>
                </button>
              </div>
            ))}
        </Slider>
      </div>
      {
        selectedDay &&
        <div className='d-flex flex-row align-items-start justify-content-between' style={{ width: "100%" }}>
          <div>
            <h3 className=" mt-5">Seleziona fascia oraria </h3>
            <p className='mb-3' style={{ marginTop: "-10px" }}>(minimo 1 ora)</p>
          </div>

        </div>
      }
      {
        selectedDay && (
          <p style={{ color: "lightgrey", fontWeight: 700, marginTop: "0px", marginBottom: "0px" }}>({giorniSettimana[new Date(selectedDay).getDay()]} {new Date(selectedDay).getDate()} {months[new Date(selectedDay).getMonth()]})</p>
        )
      }
      {
        selectedDay &&
        <div className={`slots-container ${isMobile ? "p-4" : ""} ${selectedStart && selectedEnd ? "" : "mb-4"}`}>{renderSlots()}</div>
      }
      <p className='mb-3 mt-1'>(Per prenotazioni superiori alle 4 ore scrivici su Whatsapp al numero <a href="https://wa.me/+393514206294" style={{ color: "black" }}><b>351 420 6294</b> </a>  o su Instagram a: <b>@cashmerestudiomilano</b>)</p>

      {
        selectedStart && selectedEnd && (
          <div className='w-100 d-flex flex-column align-items-center'>
            <button className="btn btn-primary mt-4 mb-4" onClick={handleNextStep} disabled={!!!bookingTime.start} style={{ border: "1px solid #08B1DF", paddingTop: "12px", paddingBottom: "12px", paddingRight: "50px", paddingLeft: "50px", fontSize: "20px", fontWeight: 700 }}>
              Avanti
            </button>
          </div>
        )
      }
    </div>
  );
};


export default Step2;