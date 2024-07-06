import React, { useState, useEffect } from 'react';
import ScrollToTop from '../../ScrollToTop';

const Step3 = ({ setService, goBack }) => {
  const [selectedServices, setSelectedServices] = useState([]);
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
    // Assuming some action to proceed to the next step
    console.log('Avanti:', selectedServices);
  };

  return (
    <ScrollToTop>
    <div>
      <p style={{ marginTop:"50px" ,textDecoration: "underline", cursor: "pointer", width: "fit-content", marginLeft:"15%" }} onClick={() => goBack()}>{"< Indietro"}</p>
      <h2 style={{ color: 'black', textAlign: 'center', fontWeight:900, marginTop:"0px" , marginBottom:"50px"}}>Seleziona i servizi</h2>
      <div className="d-flex justify-content-center w-100 align-items-center" style={{gap:"50px", flexDirection: isMobile ? "column" : "row"}}>
        <div style={{width: isMobile ? "80%" : "22%"}}>
          <div
            onClick={() => handleServiceSelection('Recording')}
            style={{
              background: isServiceSelected('Recording') ? 'linear-gradient(to right, #6FC7DF, #08B1DF)' : 'white',
              border: isServiceSelected('Recording') ? '2px solid #08B1DF' : '2px solid black',
              padding: '20px',
              cursor: 'pointer',
              textAlign: 'center',
              borderRadius: '8px',
              width: '100%',
              
            }}
          >
            <div style={{ color: isServiceSelected('Recording') ? 'white' : 'black', fontSize: '24px', fontWeight: 'bold' }}>Rec</div>
          </div>
          <p style={{ color: 'gray', fontSize: '18px', textAlign: 'start', marginTop: '10px', maxWidth:"80%" }}>Breve spiegazione sul servizio Di rec.</p>
        </div>
        <div style={{width: isMobile ? "80%" : "22%"}}>
          <div
            onClick={() => handleServiceSelection('MixAndMaster')}
            style={{
              background: isServiceSelected('MixAndMaster') ? 'linear-gradient(to right, #6FC7DF, #08B1DF)' : 'white',
              border: isServiceSelected('MixAndMaster') ? '2px solid #08B1DF' : '2px solid black',
              padding: '20px',
              cursor: 'pointer',
              textAlign: 'center',
              borderRadius: '8px',
              width: '100%',
            }}
          >
            <div style={{ color: isServiceSelected('MixAndMaster') ? 'white' : 'black', fontSize: '24px', fontWeight: 'bold' }}>Mix&Master</div>
          </div>
          <p style={{ color: 'gray', fontSize: '18px', textAlign: 'start', marginTop: '10px', maxWidth:"80%" }}>Breve spiegazione sul servizio Di mix e master.</p>
        </div>
        <div style={{width: isMobile ? "80%" : "22%"}}>
          <div
            onClick={() => handleServiceSelection('Production')}
            style={{
              background: isServiceSelected('Production') ? 'linear-gradient(to right, #6FC7DF, #08B1DF)' : 'white',
              border: isServiceSelected('Production') ? '2px solid #08B1DF' : '2px solid black',
              padding: '20px',
              cursor: 'pointer',
              textAlign: 'center',
              borderRadius: '8px',
              width: '100%',
            }}
          >
            <div style={{ color: isServiceSelected('Production') ? 'white' : 'black', fontSize: '24px', fontWeight: 'bold' }}>Produzione</div>
          </div>
          <p  style={{ color: 'gray', fontSize: '18px', textAlign: 'start', marginTop: '10px', maxWidth:"80%" }}>Breve spiegazione sul servizio Di Produzione.</p>
        </div>
      </div>
      <button onClick={handleClickAvanti} style={{fontSize:"20px", padding:"10px", paddingLeft:"50px", paddingRight:"50px", marginTop:"60px", marginBottom: "30px", fontWeight:700}}>Avanti</button>
    </div>
    </ScrollToTop>
  );
};

export default Step3;
