import AccordionCashmere from "./Accordion/Accordion"
import Bookings from "./Bookings/Bookings"
import Confirm from "./Confirm/Confirm"
import Studios from "./Studios/Studios"
import Users from "./Users/Users"
import React, { useState, useEffect } from 'react';
import NavbarAdmin from "./Navbar/Navbar"
import Calendar from "./Calendar/Calendar"
import Fonici from "./Fonici/Fonici"
import usePrenotazioni from "../contexts/PrenotazioniContext"

function Dashboard({ user }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
  const [page, setPage] = useState(0)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [selectedeFormat, setSelectedFormat] = useState('daily')
  const { fonici } = usePrenotazioni()

  const adminMail = [
    "cashmerelegal@gmail.com",
    "leonardo.cahuas7@gmail.com",
    "dystopicprod@gmail.com",
    "cashmerestudiomilano@gmail.com",
    "info.trtgraphic@gmail.com",
    "carvellidaniel2000@gmail.co",
    "g.baldazzi2001@gmail.com",
    "nicolassartirana007@gmail.com",
    "riccardo.hocke@gmail.com"
  ]

  const foniciKeys = {
    "leocahuas99@gmail.com": "0UuPD2CZ8bF8nYn7HSRn",
    "sle4music@gmail.com": "0UuPD2CZ8bF8nYn7HSRn",
    "manueltesone@gmail.com": "2lpxhZK8JKmvC3nZxR6N",
    "nico.devito17@gmail.com":"i4x1IcxsgGLUHZpfz7p7",
    "mugheddu.cla@gmail.com":"GWv5LXN8ybYY63invT8H",
    "iatruestel@gmail.com":"cqFISr8ALS1T1T3c5EIH",
    "massi.dicio@gmail.com":"3PYLl6berUod2kcXHNsp"

  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 602);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    console.log(user)
  }, [user])

  const setCont = (index) => {
    setPage(index)
    console.log("nuova pagina" + index)
  }

  const setDay = (day) => {
    setSelectedDay(day)
  }

  const setWeek = (week) => {
    setSelectedWeek(week)
  }

  const setFormat = (format) => {
    setSelectedFormat(format)
  }

  return (
    <div>
      <NavbarAdmin setCont={setCont} isAdmin={adminMail.includes(user)} />
      <div className={`${isMobile ? 'p-1' : 'p-5'}`}>



        {
          page == 0 ?
            <Studios /> :
            page == 1 ?
              <Calendar  isAdmin={adminMail.includes(user)} day={selectedDay} week={selectedWeek} setDay={setDay} setWeek={setWeek}format={selectedeFormat} setFormat={setFormat}  /> :
              page == 2 ?
                <Confirm /> :
                page == 3 ?
                  <Bookings /> :
                  page == 4 ?
                    <Fonici isAdmin={adminMail.includes(user)} fonico={adminMail.includes(user) ? "" : foniciKeys[user]}/> :
                    <Studios />
        }
      </div>
    </div>
  )
}

export default Dashboard