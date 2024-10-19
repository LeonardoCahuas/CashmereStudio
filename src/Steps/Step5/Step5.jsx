import React, { useState, useEffect } from 'react';
import usePrenotazioni from '../../booking/useBooking';
import './Step5.css';

const Step5 = ({ setSelectedFonico, goBack }) => {
    const [selectedFonico, setLocalSelectedFonico] = useState(null);
    const { fonici } = usePrenotazioni();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);

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

    const handleFonicoSelection = (fonicoId) => {
        setLocalSelectedFonico(fonicoId);
    };

    const handleNext = () => {
        setSelectedFonico(selectedFonico);
    };

    return (
        <div className="step5-container d-flex flex-column align-items-center" style={{ minHeight: "60vh", paddingBottom: "100px" }}>
            <p className={`back-link ${isMobile ? "w-75" : "w-50"} text-start`} onClick={goBack}>{"< Indietro"}</p>
            <h2 className="step5-title w-75">Seleziona un fonico per la tua sessione</h2>
            <div className={`fonici-list ${isMobile ? "w-75" : "w-50"}`}>
                <div
                    className={`fonico-item ${selectedFonico === "every" ? 'selected' : ''}`}
                >
                    <input
                        type="radio"
                        id={`fonico-every`}
                        name="fonico"
                        value={"every"}
                        style={{ width: isMobile ? "50%" : "20%" }}
                        checked={selectedFonico === "every"}
                        onChange={() => handleFonicoSelection("every")}
                    />
                    <label htmlFor={`fonico-every`}>
                        <span className="fonico-name">Primo fonico disponibile</span>
                    </label>
                </div>
                {fonici.filter(f => f.id !== 1).map((fonico) => (
                    <div 
                        key={fonico.id} 
                        className={`fonico-item ${selectedFonico === fonico.id ? 'selected' : ''}`}
                    >
                        <input
                            type="radio"
                            id={`fonico-${fonico.id}`}
                            name="fonico"
                            value={fonico.id}
                            style={{ width: isMobile ? "50%" : "20%" }}
                            checked={selectedFonico === fonico.id}
                            onChange={() => handleFonicoSelection(fonico.id)}
                        />
                        <label htmlFor={`fonico-${fonico.id}`}>
                            <span className="fonico-name">{fonico.nome}</span>
                        </label>
                    </div>
                ))}
            </div>
            <button 
                className="next-button"
                onClick={handleNext} 
                disabled={!selectedFonico}
            >
                Avanti
            </button>
        </div>
    );
};

export default Step5;
