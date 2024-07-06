import React from 'react';
import './Step1.css';
import cashead from "../../assets/cashead.png"
import stu1 from "../../assets/stu1.png"
import stu2 from "../../assets/Studio2/CV1A3606.jpg"
import stu3 from "../../assets/stu3.png"
import { useState , useEffect} from "react";

const images = [
    "",
    stu1,
    stu2,
    stu3
]
function CardStu({ index, selectStu }) {
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


    const selectStudio = () => {
        selectStu(index)
    }

    return (
        <div className={`card ${isMobile ? "w-75" : "w-25"} d-flex flex-column align-items-center`}>
            <div className="card-image" >
                <img src={images[index]} alt="Card Image" className='card-image-cont'/>
            </div>
            <div className="card-content w-100 d-flex flex-column align-items-center">
                <h3 className="card-title text-center" style={{textAlign:"center", fontSize:"35px", fontWeight:600}}>Studio {index}</h3>
                <button onClick={selectStudio} className="card-button">Prenota</button>
            </div>
        </div>
    );
}

export default CardStu;
