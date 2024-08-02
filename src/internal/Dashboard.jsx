import AccordionCashmere from "./Accordion/Accordion"
import Bookings from "./Bookings/Bookings"
import Confirm from "./Confirm/Confirm"
import Studios from "./Studios/Studios"
import Users from "./Users/Users"
import React, { useState, useEffect } from 'react';
import NavbarAdmin from "./Navbar/Navbar"
import Calendar from "./Calendar/Calendar"
import Fonici from "./Fonici/Fonici"

function Dashboard() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
const [page, setPage] = useState(0)
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

  const setCont = (index) => {
     setPage(index)
     console.log("nuova pagina" + index)
  }
  return (
    <div>
      <NavbarAdmin setCont={setCont}/>
      <div className={`${isMobile ? 'p-1' : 'p-5'}`}>
       


        {
          page == 0 ? 
          <Studios/> :
          page == 1 ?
          <Calendar/> :
          page == 2 ?
          <Confirm/> :
          page == 3 ?
          <Bookings/> :
          page == 4 ?
          <Fonici/> :
          <Studios/>
        }
      </div>
    </div>
  )
}

export default Dashboard