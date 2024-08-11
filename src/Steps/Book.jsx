import { useState, useEffect } from "react"
import usePrenotazioni from "../booking/useBooking"
import Navbar from "../components/Navbar/Navbar"
import Navsteps from "./Navsteps/Navsteps"
import Step1 from "./Step1/Step1"
import Step2 from "./Step2/Step2"
import Step3 from "./Step3/Step3"
import Step4 from "./Step4/Step4"

function Book() {
    const { prenotazioni, loading, error, addPrenotazione } = usePrenotazioni()
    const [stu, setStu] = useState(0)
    const [bookingTime, setBookingTime] = useState({})
    const [service, setService] = useState(null)
    const [userInfo, setUserInfo] = useState({})
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
    const [needFonico, setNeedFonico] = useState()

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

    const setStudio = (index) => {
        setStu(index)
    }

    const goBack1 = () => {
        setStu(null)
    }

    const goBack3 = () => {
        setService(null)
    }

    const goBack2 = () => {
        setBookingTime({})
    }

    const setBooking = (bookingInfo) => {
        setBookingTime(bookingInfo)
        console.log("bookinginfo")
        console.log(bookingInfo)
    }

    const setSessionFonico = (fonico) => {
        setNeedFonico(fonico)
    }

    const setServices = (services) => {
        console.log(services)
        setService(services)
    }

    return (
        <div>
            <Navbar />
            <div style={{ paddingTop: isMobile ? "100px" : "100px" }}>
                {
                    !stu && !bookingTime.start && !service && !userInfo.insta ?
                        <Step1 setStudio={setStudio} />
                        : stu && !bookingTime.start && !service && !userInfo.insta ?
                            <Step2 studio={stu} setBooking={setBooking} goBack={goBack1} />
                            : stu && bookingTime.start && !service && !userInfo.insta ?
                                <Step3 setService={setServices} goBack={goBack2} setSessionFonico={setSessionFonico} /> :
                                <Step4 goBack={goBack3} onAddPrenotazione={addPrenotazione} selectedDay={bookingTime.day} selectedEnd={bookingTime.end} selectedStart={bookingTime.start} studio={stu} services={service} needFonico={needFonico} />


                }

            </div>

        </div>
    )
}
export default Book