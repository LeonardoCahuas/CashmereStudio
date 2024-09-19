import React, { useState, useEffect } from 'react';

const Step3 = ({ setService, goBack, setSessionFonico }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 602);
  const [fonico, setFonico] = useState(null);

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

  const handleServiceSelection = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const isServiceSelected = (service) => {
    return selectedServices.includes(service);
  };

  const handleClickAvanti = () => {
    setService(selectedServices);
    setSessionFonico(fonico == "si" ? true : false)

    // Assuming some action to proceed to the next step
    console.log('Avanti:', selectedServices, 'Fonico:', fonico);
  };

  const handleFonicoChange = (event) => {
    setFonico(event.target.value);
  };

  return (
    <div style={{ paddingBottom: "200px" }}>
      <p
        style={{
          marginTop: "50px",
          textDecoration: "underline",
          cursor: "pointer",
          width: "fit-content",
          marginLeft: "15%"
        }}
        onClick={() => goBack()}
      >
        {"< Indietro"}
      </p>
      <h2
        style={{
          color: 'black',
          textAlign: 'center',
          fontWeight: 900,
          marginTop: "0px",
          marginBottom: "50px"
        }}
      >
        Seleziona i servizi
      </h2>
      <div
        className={`d-flex justify-content-center w-100 align-items-${isMobile ? "center" : "start"}`}
        style={{ gap: isMobile ? "10px" : "50px", flexDirection: isMobile ? "column" : "row" }}
      >
        <div style={{ width: isMobile ? "80%" : "22%" }}>
          <div
            onClick={() => handleServiceSelection('Rec')}
            style={{
              background: isServiceSelected('Rec') ? 'linear-gradient(to right, #6FC7DF, #08B1DF)' : 'white',
              border: isServiceSelected('Rec') ? '2px solid #08B1DF' : '2px solid black',
              padding: isMobile ? "8px" : '20px',
              cursor: 'pointer',
              textAlign: 'center',
              borderRadius: '8px',
              width: '100%',
            }}
          >
            <div
              style={{
                color: isServiceSelected('Rec') ? 'white' : 'black',
                fontSize: '24px',
                fontWeight: 'bold'
              }}
            >
              Rec
            </div>
          </div>
          <p
            style={{
              color: 'gray',
              fontSize: isMobile ? "12px" : '15px',
              textAlign: 'start',
              marginTop: '10px',
              maxWidth: "100%"
            }}
          >
            La fase di registrazione è quella in cui l'artista registra le sue parti musicali al micorofono.
          </p>
        </div>
        <div style={{ width: isMobile ? "80%" : "22%" }}>
          <div
            onClick={() => handleServiceSelection('MixAndMaster')}
            style={{
              background: isServiceSelected('MixAndMaster') ? 'linear-gradient(to right, #6FC7DF, #08B1DF)' : 'white',
              border: isServiceSelected('MixAndMaster') ? '2px solid #08B1DF' : '2px solid black',
              padding: isMobile ? "8px" : '20px',
              cursor: 'pointer',
              textAlign: 'center',
              borderRadius: '8px',
              width: '100%',
            }}
          >
            <div
              style={{
                color: isServiceSelected('MixAndMaster') ? 'white' : 'black',
                fontSize: '24px',
                fontWeight: 'bold'
              }}
            >
              Mix&Master
            </div>
          </div>
          <p
            style={{
              color: 'gray',
              fontSize: isMobile ? "12px" : '15px',
              textAlign: 'start',
              marginTop: '10px',
              maxWidth: "100%"
            }}
          >
            Il Mix&Master è il processo finale di lavorazione sul beat e sulla voce, che serve a far suonare in modo professionale una canzone.
          </p>
        </div>
        <div style={{ width: isMobile ? "80%" : "22%" }}>
          <div
            onClick={() => handleServiceSelection('Produzione')}
            style={{
              background: isServiceSelected('Produzione') ? 'linear-gradient(to right, #6FC7DF, #08B1DF)' : 'white',
              border: isServiceSelected('Produzione') ? '2px solid #08B1DF' : '2px solid black',
              padding: isMobile ? "8px" : '20px',
              cursor: 'pointer',
              textAlign: 'center',
              borderRadius: '8px',
              width: '100%',
            }}
          >
            <div
              style={{
                color: isServiceSelected('Produzione') ? 'white' : 'black',
                fontSize: '24px',
                fontWeight: 'bold'
              }}
            >
              Produzione
            </div>
          </div>
          <p
            style={{
              color: 'gray',
              fontSize: isMobile ? "12px" : '15px',
              textAlign: 'start',
              marginTop: '10px',
              maxWidth: "100%"
            }}
          >
            Il nostro servizio di produzione musicale offre beat personalizzati di alta qualità.
          </p>
        </div>
      </div>
      <div className='w-100 d-flex flex-column align-items-center justify-contwnt-center' style={{ textAlign: 'center', marginTop: '40px',width: "80%" }}>
        <div style={{width:"80%"}}>
          <h3 style={{ fontSize: isMobile ? "16px" : "20px", marginBottom: "20px", textAlign: isMobile ? "left" : "center", color: "grey" }}>Desideri avere il fonico per la tua sessione o sei interessato solo allaffitto della sala?</h3>
          <div className={`w-100 d-flex flex-${isMobile ? "column" : "row"} justify-content-center`} style={{ gap: isMobile ? "10px" : "30px" }}>
            <label style={{ marginRight: '20px', display: "flex", flexDirection: "row", alignItems: "center", gap: "5px" }}>
              <input
                type="radio"
                value="si"
                checked={fonico === 'si'}
                onChange={handleFonicoChange}
                style={{
                  appearance: 'none', // Rimuove lo stile predefinito del radio
                  width: '20px',
                  height: '20px',
                  border: `2px solid ${fonico == "si" ? "#08B1DF" : "black"}`,
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  backgroundColor: fonico == "si" ? "#08B1DF" : "white"
                }}
              />
              Desidero il fonico
            </label>
            <label style={{ marginRight: '20px', display: "flex", flexDirection: "row", alignItems: "center", gap: "5px" }}>
              <input
                type="radio"
                value="no"
                checked={fonico === 'no'}
                onChange={handleFonicoChange}
                style={{
                  appearance: 'none', // Rimuove lo stile predefinito del radio
                  width: '20px',
                  height: '20px',
                  border: `2px solid ${fonico == "no" ? "#08B1DF" : "black"}`,
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  backgroundColor: fonico == "no" ? "#08B1DF" : "white"
                }}
              />
              Solo affitto sala
            </label>
          </div>
        </div>
      </div>
      <button
        onClick={handleClickAvanti}
        style={{
          fontSize: "20px",
          padding: "10px",
          paddingLeft: "50px",
          paddingRight: "50px",
          marginTop: "60px",
          marginBottom: "30px",
          fontWeight: 700,
          background: fonico === null ? 'grey' : 'linear-gradient(to right, #08B1DF, #6FC7DF)'
        }}
        disabled={fonico === null}
      >
        Avanti
      </button>
    </div>
  );
};

export default Step3;
