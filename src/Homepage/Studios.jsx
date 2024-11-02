import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import './Homepage.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import stu11 from "../assets/Studio1/CV1A3622.jpg";
import stu12 from "../assets/Studio1/CV1A3626.jpg";
import stu13 from "../assets/Studio1/CV1A3631.jpg";
import stu14 from "../assets/Studio1/CV1A3641.jpg";

import stu21 from "../assets/Studio2/CV1A3606.jpg";
import stu22 from "../assets/Studio2/CV1A3609.jpg";
import stu23 from "../assets/Studio2/CV1A3610.jpg";
import stu24 from "../assets/Studio2/CV1A3615.jpg";
import stu25 from "../assets/Studio2/CV1A3618.jpg";

import stu31 from "../assets/Studio3/CV1A3644.jpg";
import stu32 from "../assets/Studio3/CV1A3646.jpg";
import stu33 from "../assets/Studio3/CV1A3649.jpg";

import stu11mob from "../assets/STUDIO1mob/mob1.jpg";
import stu12mob from "../assets/STUDIO1mob/mob2.jpg";
import stu13mob from "../assets/STUDIO1mob/mob3.jpg";
import stu14mob from "../assets/STUDIO1mob/mob4.jpg";
import stu15mob from "../assets/STUDIO1mob/mob5.jpg";
import stu16mob from "../assets/STUDIO1mob/mob6.jpg";

import stu21mob from "../assets/STUDIO2mob/mob1.jpg";
import stu22mob from "../assets/STUDIO2mob/mob2.jpg";
import stu23mob from "../assets/STUDIO2mob/mob3.jpg";
import stu24mob from "../assets/STUDIO2mob/mob4.jpg";

import stu31mob from "../assets/STUDIO3mob/mob1.jpg";
import stu32mob from "../assets/STUDIO3mob/mob2.jpg";
import stu33mob from "../assets/STUDIO3mob/mob3.jpg";

import { Link } from 'react-router-dom';
import next from "../assets/next.png"
import prev from "../assets/back.png"
const images = [
    "",
    [
        stu11,
        stu12,
        stu13,
        stu14
    ],
    [
        stu21,
        stu22,
        stu23,
        stu24,
        stu25
    ],
    [
        stu31,
        stu32,
        stu33
    ]
];

const imagesMob = [
    "",
    [
        stu11mob,
        stu12mob,
        stu13mob,
        stu14mob,
        stu15mob,
        stu16mob
    ],
    [
        stu21mob,
        stu22mob,
        stu23mob,
        stu24mob,
    ],
    [
        stu31mob,
        stu32mob,
        stu33mob
    ]
];

const NextArrow = (props) => {
    const { className, style, onClick } = props;

    return (
        <div
            className={`${className} slick-next flex-column align-items-center justify-content-center`}
            style={{ ...style, borderRadius: '50%', right: '50px', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            onClick={onClick}
        >
            <img src={next} className="arrow-img" alt="Icona freccia" style={{ width: "30px", height: "30px", position: "absolute", right: '0px' }} />
        </div>
    );
};

const PrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} slick-next flex-column align-items-center justify-content-center`}
            style={{ ...style, borderRadius: '50%', left: '50px', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            onClick={onClick}
        >
            <img src={prev} className="arrow-img" alt="Icona freccia" style={{ width: "30px", height: "30px", position: "absolute", right: '0px' }} />
        </div>
    );
};

function StudioSection({ title, description, bgColor, index }) {
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
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />
    };





    return (
        <div className="studio-section d-flex flex-column align-items-center" style={{ backgroundColor: bgColor }}>
            <h1 className="studio-title" style={{ color: bgColor === "black" ? "white" : "black", paddingTop: (title == "Studio 1")  ? "0px" : "70px", fontSize: isMobile ? "40px" : "70px", fontWeight: 900, width: "100vw", marginTop: "40px" }}>{title}</h1>
            <div className="studio-buttons">
                <Link to={`/studio${index}`}>
                    <button style={{ fontWeight: 900 , paddingRight: "10px", paddingLeft:"10px", paddingTop:"5px", paddingBottom:"5px"}} className="button button-filled">Scopri di più</button>
                </Link>
                <Link to="/book" >
                    <button className="button button-outline" style={{ backgroundColor: bgColor == "black" ? "black" : "white", color: bgColor == "black" ? "white" : "#08B1DF", paddingRight: "10px", paddingLeft:"10px", paddingTop:"5px", paddingBottom:"5px" }}>Prenota una sessione</button>
                </Link>
            </div>
            <Slider {...settings} className="studio-slider">
                {!isMobile ? (
                    images[index].map((img, i) => (
                        <img key={i} src={img} alt={`studio-${index}-${i}`} className="studio-image" />
                    ))
                ) : (
                    imagesMob[index].map((img, i) => (
                        <img key={i} src={img} alt={`studio-${index}-${i}`} className="studio-image" />
                    ))
                )}

            </Slider>
        </div>
    );
}


function Studios() {
    return (
        <div className='bg-white d-flex flex-column align-items-center' style={{ marginBottom: "0px", gap:"-30px"}}>
            <h1 className="studios-header">I NOSTRI STUDI</h1>
            <StudioSection
                title="Studio 1"
                description="33 mq"
                bgColor="white"
                index={1}
            />
            <StudioSection
                title="Studio 2"
                description="26 mq"
                bgColor="black"
                index={2}
            />
            <StudioSection
                title="Studio 3"
                description="23 mq"
                bgColor="white"
                index={3}
            />
        </div>
    );
}

export default Studios;
