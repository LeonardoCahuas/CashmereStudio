import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const Step3 = ({ setService, goBack, setSessionFonico, setSelectedFonico, setSkipFonicoSelection }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 802);
  const [fonico, setFonico] = useState(null);
  const [showPackageModal, setShowPackageModal] = useState(false); // State for the modal
  const [selectedPackage, setSelectedPackage] = useState(null); // State for selected package
  const [pack, setPack] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 802);
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
    if (selectedPackage && pack > 0) {
      setService([...selectedServices,
        pack == 1 ? "2h + mix&master" :
        pack == 2 ? "2h + mix&master + beat" :
        pack == 3 ? "4h + 2 mix&master" : 
        "beat in session"
      ]);
    } else {
      setService(selectedServices);
    }
    if (fonico === 'no') {
      setSelectedFonico(1);
      setSkipFonicoSelection(true);
    } else {
      setSkipFonicoSelection(false);
    }
  };

  const handleFonicoChange = (event) => {
    const value = event.target.value;
    setFonico(value);
  };

  // Handle modal open and close
  const handleOpenModal = () => setShowPackageModal(true);
  const handleCloseModal = () => setShowPackageModal(false);

  // Handle package selection inside the modal
  const handlePackageSelection = () => {
    setSelectedPackage(pack > 0);
    handleCloseModal(); // Close modal after selecting a package
  };

  return (
    <div style={{ paddingBottom: '200px' }}>
      <p
        style={{
          marginTop: '50px',
          textDecoration: 'underline',
          cursor: 'pointer',
          width: 'fit-content',
          marginLeft: '15%',
        }}
        onClick={() => goBack()}
      >
        {'< Indietro'}
      </p>
      <h2
        style={{
          color: 'black',
          textAlign: 'center',
          fontWeight: 900,
          marginTop: '0px',
          marginBottom: '50px',
        }}
      >
        Seleziona i servizi
      </h2>
      <div
        className={`d-flex justify-content-center w-100 align-items-${isMobile ? 'center' : 'start'}`}
        style={{ gap: isMobile ? '10px' : '50px', flexDirection: isMobile ? 'column' : 'row' }}
      >
        <div style={{ width: isMobile ? '80%' : '22%' }}>
          <div
            onClick={() => handleServiceSelection('Rec')}
            style={{
              background: isServiceSelected('Rec') ? 'linear-gradient(to right, #6FC7DF, #08B1DF)' : 'white',
              border: isServiceSelected('Rec') ? '2px solid #08B1DF' : '2px solid black',
              padding: isMobile ? '8px' : '20px',
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
                fontWeight: 'bold',
              }}
            >
              Registrazione
            </div>
          </div>
          <p
            style={{
              color: 'gray',
              fontSize: isMobile ? '12px' : '15px',
              textAlign: 'start',
              marginTop: '10px',
              maxWidth: '100%',
            }}
          >
            La fase di registrazione è quella in cui l'artista registra le sue parti musicali al microfono.
          </p>
        </div>
        <div style={{ width: isMobile ? '80%' : '22%' }}>
          <div
            onClick={() => handleServiceSelection('MixAndMaster')}
            style={{
              background: isServiceSelected('MixAndMaster') ? 'linear-gradient(to right, #6FC7DF, #08B1DF)' : 'white',
              border: isServiceSelected('MixAndMaster') ? '2px solid #08B1DF' : '2px solid black',
              padding: isMobile ? '8px' : '20px',
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
                fontWeight: 'bold',
              }}
            >
              Mix&Master
            </div>
          </div>
          <p
            style={{
              color: 'gray',
              fontSize: isMobile ? '12px' : '15px',
              textAlign: 'start',
              marginTop: '10px',
              maxWidth: '100%',
            }}
          >
            Il Mix&Master è il processo finale di lavorazione sul beat e sulla voce, che serve a far suonare in modo professionale una canzone.
          </p>
        </div>
        <div style={{ width: isMobile ? '80%' : '22%' }}>
          <div
            onClick={handleOpenModal}
            style={{
              background: selectedPackage ? 'linear-gradient(to right, #6FC7DF, #08B1DF)' : 'white',
              border:selectedPackage ? '2px solid #08B1DF' : '2px solid black',
              padding: isMobile ? '8px' : '20px',
              cursor: 'pointer',
              textAlign: 'center',
              borderRadius: '8px',
              width: '100%',
            }}
          >
            <div
              style={{
                color: selectedPackage ? 'white' : 'black',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              Pacchetti
            </div>
          </div>
          <p
            style={{
              color: 'gray',
              fontSize: isMobile ? '12px' : '15px',
              textAlign: 'start',
              marginTop: '10px',
              maxWidth: '100%',
            }}
          >
            Scegli tra i nostri pacchetti di servizi musicali.
          </p>
        </div>
      </div>
      <div
        className="w-100 d-flex flex-column align-items-center justify-content-center"
        style={{ textAlign: 'center', marginTop: '40px', width: '80%' }}
      >
        <div style={{ width: '80%' }}>
          <h3
            style={{
              fontSize: isMobile ? '16px' : '20px',
              marginBottom: '20px',
              textAlign: isMobile ? 'left' : 'center',
              color: 'grey',
            }}
          >
            Desideri avere il fonico per la tua sessione o sei interessato solo all'affitto della sala?
          </h3>
          <div
            className={`w-100 d-flex flex-${isMobile ? 'column' : 'row'} justify-content-center`}
            style={{ gap: isMobile ? '10px' : '30px' }}
          >
            <label
              style={{
                marginRight: '20px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <input
                type="radio"
                value="si"
                checked={fonico === 'si'}
                onChange={handleFonicoChange}
                style={{
                  appearance: 'none',
                  width: '20px',
                  height: '20px',
                  border: `2px solid ${fonico === 'si' ? '#08B1DF' : 'black'}`,
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer',
                  backgroundColor: fonico === 'si' ? '#08B1DF' : 'white',
                }}
              />
              Desidero il fonico
            </label>
            <label
              style={{
                marginRight: '20px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <input
                type="radio"
                value="no"
                checked={fonico === 'no'}
                onChange={handleFonicoChange}
                style={{
                  appearance: 'none',
                  width: '20px',
                  height: '20px',
                  border: `2px solid ${fonico === 'no' ? '#08B1DF' : 'black'}`,
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer',
                  backgroundColor: fonico === 'no' ? '#08B1DF' : 'white',
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
          fontSize: '20px',
          padding: '10px',
          paddingLeft: '50px',
          paddingRight: '50px',
          marginTop: '60px',
          marginBottom: '30px',
          fontWeight: 700,
          background: fonico === null ? 'grey' : 'linear-gradient(to right, #08B1DF, #6FC7DF)',
        }}
        disabled={fonico === null}
      >
        Avanti
      </button>

      {/* Modal for package selection */}
      <Modal show={showPackageModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scegli il tuo pacchetto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div>
              <label>
                <input
                  type="radio"
                  name="package"
                  value="2h + mix e master"
                  onChange={() => setPack(1)}
                />
                {' 2h + mix e master'}
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  name="package"
                  value="2h + mix e master + beat"
                  onChange={() => setPack(2)}
                />
                {' 2h + mix e master + beat'}
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  name="package"
                  value="4h + 2 mix e master"
                  onChange={() => setPack(3)}
                />
                {' 4h + 2 mix e master'}
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  name="package"
                  value="beat in session"
                  onChange={() => setPack(4)}
                />
                {' Beat in session'}
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  name="package"
                  value="nessun pacchetto"
                  onChange={() => setPack(0)}
                />
                {' Nessun pacchetto'}
              </label>
            </div>
          </div>
        </Modal.Body>
        <Modal-Footer style={{display:"flex", flexDirection:"row", justifyContent:"right", padding:"10px", gap:"10px"}} >
          <button style={{background:"transparent", backgroundColor:"transparent", color:"green", border:"2px solid green", padding:"5px"}} onClick={handlePackageSelection}>Conferma</button>
          <button style={{background:"transparent", backgroundColor:"transparent", color:"black", border:"2px solid black", padding:"5px"}} onClick={handleCloseModal}>Chiudi</button>
        </Modal-Footer>

      </Modal>
    </div>
  );
};

export default Step3;
