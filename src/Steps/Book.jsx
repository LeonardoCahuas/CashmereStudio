import { useState, useEffect } from "react"
import usePrenotazioni from "../booking/useBooking"
import Navbar from "../components/Navbar/Navbar"
import Step1 from "./Step1/Step1"
import Step3 from "./Step3/Step3"
import Step5 from "./Step5/Step5"
import Step2 from "./Step2/Step2"
import Step4 from "./Step4/Step4"

function Book() {
    const { addPrenotazione } = usePrenotazioni()
    const [stu, setStu] = useState(0)
    const [bookingTime, setBookingTime] = useState({})
    const [service, setService] = useState(null)
    const [userInfo, setUserInfo] = useState({})
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
    const [selectedFonico, setSelectedFonico] = useState(null)
    const [skipFonicoSelection, setSkipFonicoSelection] = useState(false);

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

    const setStudio = (index) => {
        setStu(index)
    }

    const goBack1 = () => {
        setStu(null)
    }

    const goBack3 = () => {
        setService(null)
    }

    const goBack5 = () => {

        if (skipFonicoSelection) {
            setService(null)
            setSelectedFonico(null)
        } else {
            setService(null)
            setSelectedFonico(null)
        }

    }

    const goBack2 = () => {
        setBookingTime({})
    }

    const setBooking = (bookingInfo) => {
        setBookingTime(bookingInfo)
    }

    const setServices = (services) => {
        setService(services)
    }

    const setSessionFonico = (fonico) => {
        setNeedFonico(fonico)
    }

    return (
        <div>
            <Navbar />
            <div style={{ paddingTop: isMobile ? "100px" : "100px" }}>
                {!stu ? (
                    <Step1 setStudio={setStudio} />
                ) : !service ? (
                    <Step3
                        setService={setServices}
                        goBack={goBack1}
                        setSelectedFonico={setSelectedFonico}
                        setSkipFonicoSelection={setSkipFonicoSelection}
                    />
                )  : (!selectedFonico && !skipFonicoSelection) ? (
                    <Step5 setSelectedFonico={setSelectedFonico} goBack={goBack3} />
                )  : !bookingTime.start ? (
                    <Step2 studio={stu} setBooking={setBooking} goBack={goBack5} selectedFonico={selectedFonico == "every" || skipFonicoSelection || !selectedFonico ? null : selectedFonico} service={service} setStudio={setStudio} />
                ) : (
                    <Step4 goBack={goBack2} onAddPrenotazione={addPrenotazione} selectedDay={bookingTime.day} selectedEnd={bookingTime.end} selectedStart={bookingTime.start} studio={stu} services={service} selectedFonico={selectedFonico == "every" ? null : selectedFonico} needFonico={!skipFonicoSelection} />
                )}
            </div>
        </div>
    )
}

export default Book