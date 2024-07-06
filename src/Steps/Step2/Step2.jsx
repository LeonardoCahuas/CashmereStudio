import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import usePrenotazioni from '../../booking/useBooking';
import './Step2.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ScrollToTop from '../../ScrollToTop';
const months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

const giorniSettimana = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} slick-next flex-column align-items-center justify-content-center`}
      style={{ ...style, borderRadius: '50%', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "20px" }}
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
      style={{ ...style, borderRadius: '50%', left: '10px', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "20px" }}
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
  slidesToShow: 2,
  slidesToScroll: 2,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
  className: 'custom-slider',
  rows: 1
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

const Step2 = ({ setBooking, goBack, studio }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const { prenotazioni, loading, error, addPrenotazione } = usePrenotazioni(selectedDay);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [bookingTime, setBookingTime] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 602);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call initially to set the correct state

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

  const handleSlotClick = (time) => {
    const [selectedStartHourPart, selectedStartMinutePart] = selectedStart ? selectedStart.split(':') : [null, null];
    const selectedStartHour = selectedStartHourPart ? parseFloat(selectedStartHourPart) + (selectedStartMinutePart === '30' ? 0.5 : 0) : null;
    const [currentHourPart, currentMinutePart] = time.split(':');
    const currentHour = parseFloat(currentHourPart) + (currentMinutePart === '30' ? 0.5 : 0);

    if (!selectedStart || (selectedStart && selectedEnd) || (selectedStart && currentHour < selectedStartHour + 1)) {
      setSelectedStart(time);
      setSelectedEnd(null);
    } else if (time > selectedStart) {
      setSelectedEnd(time);
    } else {
      setSelectedStart(time);
      setSelectedEnd(null);
    }
  };


  const handleNextStep = () => {
    setBooking(bookingTime);
  };

  const renderSlots = () => {
    const slots = [];
    const selectedDayPrenotazioni = prenotazioni.filter(
      (p) => getFormattedDate(new Date(p.inizio.seconds * 1000)) === selectedDay && p.studio == studio && p.stato == 2
    );
    let occupied = [];
    let preoccupied = [];

    // Raccogli gli slot che devono essere grigiati
    selectedDayPrenotazioni.forEach((p) => {
      const startDate = new Date(p.inizio.seconds * 1000);
      const endDate = new Date(p.fine.seconds * 1000);
      const startHour = startDate.getHours();
      const endHour = endDate.getHours();
      const startMinute = startDate.getMinutes();
      const endMinute = endDate.getMinutes();
      const startTime = startHour + startMinute / 60;
      const endTime = endHour + endMinute / 60;

      for (let hour = startTime; hour < endTime; hour += 0.5) {
        occupied.push(hour);
      }

      // Aggiungi i quattro slot precedenti
      for (let i = 0; i <= 1; i++) {
        const precedingSlot = startTime - i * 0.5;
        if (precedingSlot >= 10) {
          preoccupied.push(precedingSlot);
        }
      }
    });

    const isTimeAvailable = (time) => {
      if (!selectedStart) return true;
      const [selectedStartHourPart, selectedStartMinutePart] = selectedStart.split(':');
      const selectedStartHour = parseFloat(selectedStartHourPart) + (selectedStartMinutePart === '30' ? 0.5 : 0);
      const [currentHourPart, currentMinutePart] = time.split(':');
      const currentHour = parseFloat(currentHourPart) + (currentMinutePart === '30' ? 0.5 : 0);

      if (currentHour <= selectedStartHour) return true;

      for (let hour = selectedStartHour; hour <= currentHour; hour += 0.5) {
        if (occupied.includes(hour)) return false;
      }
      return true;
    };

    const isEndValid = (time) => {
      if (!selectedStart) return true;
      const [selectedStartHourPart, selectedStartMinutePart] = selectedStart.split(':');
      const selectedStartHour = parseFloat(selectedStartHourPart) + (selectedStartMinutePart === '30' ? 0.5 : 0);
      const [currentHourPart, currentMinutePart] = time.split(':');
      const currentHour = parseFloat(currentHourPart) + (currentMinutePart === '30' ? 0.5 : 0);

      return currentHour - selectedStartHour >= 1;
    };

    for (let hour = 10; hour < 22; hour += 0.5) {
      const hourPart = Math.floor(hour);
      const minutePart = hour % 1 === 0.5 ? '30' : '00';
      const time = `${String(hourPart).padStart(2, '0')}:${minutePart}`;

      const isOccupied = selectedDayPrenotazioni.some((p) => {
        const startDate = new Date(p.inizio.seconds * 1000);
        const endDate = new Date(p.fine.seconds * 1000);
        const startHour = startDate.getHours();
        const endHour = endDate.getHours();
        const startMinute = startDate.getMinutes();
        const endMinute = endDate.getMinutes();

        // Calcola l'ora di fine correttamente riducendo di mezz'ora


        let endTime = endHour + (endMinute / 60);
        if (endMinute >= 30) {
          endTime -= 0.5;
        } else {
          endTime = endHour - 1 + 0.5;
        }

        let startTime = startHour + (endMinute / 60);
        if (startMinute <= 30) {
          startTime += 0.5;
        } else {
          startTime = endHour + 1 - 0.5;
        }

        return startTime <= hour && endTime > hour;
      });

      const isBooked = occupied.includes(hour);
      const isPreBooked = preoccupied.includes(hour);
      const isSelectedStart = selectedStart === time;
      const isSelectedEnd = selectedEnd === time;
      const isSelectedRange = selectedStart && selectedEnd && time > selectedStart && time < selectedEnd;
      const isClickable = isTimeAvailable(time);
      const canSelectEnd = isEndValid(time);

      const slotClass = (() => {
        if (isSelectedStart) return 'selected-start';
        if (isSelectedRange) return 'selected-range';
        if (isBooked) return 'occupied';
        if (isPreBooked && selectedEnd !== time && !selectedStart) return 'grayed';
        if (isSelectedEnd) return 'selected-end';
        if (selectedStart && isPreBooked && isClickable) return '';
        return '';
      })();

      slots.push(
        <div
          key={time}
          className={`slot ${slotClass}`}
          onClick={() => ((!isOccupied && !isBooked && !isPreBooked && !selectedStart) || (selectedStart && isClickable && canSelectEnd)) && handleSlotClick(time)}
        >
          {time}
        </div>
      );
    }

    slots.push(
      <div className='d-flex flex-row align-items-center justify-content-center' onClick={() => annulla()} style={{ borderBottom: "2px solid black", paddingBottom: "0px" , gap:"4px" ,height:"30px", marginLeft:"20px"}}>
        <i class="fa fa-close m-0" style={{ fontSize: "13px", marginRight: "0x" }}></i>
        <p className='m-0 p-0'>Annulla</p>

      </div>)

    return slots;
  };

  return (
    <ScrollToTop>
      <div className="container mt-5 text-start">
        <div style={{ paddingLeft: isMobile ? "20px" : "0px" }}>
          <p style={{ textDecoration: "underline", cursor: "pointer", width: "fit-content" }} onClick={() => goBack()}>{"< Indietro"}</p>
          <h2 className="mb-3 text-start fs-1" style={{ fontWeight: '800' }}>
            Data e ora della sessione
          </h2>
          <h6 className="mt-5 fs-5 mb-4">Seleziona data</h6>
        </div>
        <div className="w-100 d-flex flex-row custom-slider-container" style={{ height: '130px' }}>
          <Slider {...settings} className="week-slider custom-slider w-100" style={{ height: '130px', padding: isMobile ? "0px" : '30px' }}>
            {getMonthDays()
              .filter((day) => day)
              .map((day, index) => (
                <div key={index} className="day-slide" style={{ width: '200px', backgroundColor: "transparent" }}>
                  <button
                    className={`day-button ${day.date === selectedDay ? 'selected' : ''} d-flex flex-column justify-content-center`}
                    onClick={() => setSelectedDay(day.date)}
                    style={{ width: isMobile ? "150px" : '200px', backgroundColor: "white", border: day.date === selectedDay ? "2px solid #08B1DF" : "2px solid black", color: day.date === selectedDay ? "white" : "black", textAlign: "start" }}
                  >
                    <p className='text-start w-75 fs-5'>{`${giorniSettimana[new Date(day.date).getDay()]}`}</p><p className='text-start w-75 fs-5' style={{ fontWeight: 800, marginTop: "-20px" }}> {`${new Date(day.date).getDate()} ${months[new Date(day.date).getMonth()]}`}</p>
                  </button>
                </div>
              ))}
          </Slider>
        </div>
        {
          selectedDay &&
          <div className='d-flex flex-row align-items-start justify-content-between' style={{ width: "100%" }}>
            <div>
              <h3 className="mb-3 mt-5">Seleziona fascia oraria </h3>
              <p className='mb-3 mt-5'>(minimo 1 ora)</p>
            </div>

          </div>
        }
        {
          selectedDay && (
            <p style={{ color: "lightgrey", fontWeight: 700, marginTop: "-15px", marginBottom: "50px" }}>({giorniSettimana[new Date(selectedDay).getDay()]} {new Date(selectedDay).getDate()} {months[new Date(selectedDay).getMonth()]})</p>
          )
        }
        {
          selectedDay &&
          <div className={`slots-container ${isMobile ? "p-4" : ""} ${selectedStart && selectedEnd ? "" : "mb-4"}`}>{renderSlots()}</div>
        }
        {
          selectedStart && selectedEnd && (
            <div className='w-100 d-flex flex-column align-items-center'>
              <button className="btn btn-primary mt-4 mb-4" onClick={handleNextStep} disabled={!!!bookingTime.start} style={{ border: "1px solid #08B1DF", paddingTop: "12px", paddingBottom: "12px", paddingRight: "50px", paddingLeft: "50px", fontSize: "20px" , fontWeight:700}}>
                Avanti
              </button>
            </div>
          )
        }
      </div>

    </ScrollToTop>
  );
};


export default Step2;