import { useState, useEffect } from "react";
import ScrollToTop from "../../ScrollToTop";
import CardStu from "./CardStu"
function Step1({ setStudio }) {
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

    const select = (index) => {
        setStudio(index)
    }
    return (
        <ScrollToTop>
            <div style={{ paddingTop: "100px", paddingBottom: "200px" }}>
                <h2 className="mb-5" style={{fontWeight:600}}>Quale studio vuoi prenotare?</h2>
                <div className="d-flex align-items-center justify-content-center" style={{ gap: "50px", flexDirection: isMobile ? "column" : "row" }}>
                    <CardStu index={1} selectStu={select} />
                    <CardStu index={2} selectStu={select} />
                    <CardStu index={3} selectStu={select} />
                </div>
            </div>
        </ScrollToTop>
    )
}

export default Step1