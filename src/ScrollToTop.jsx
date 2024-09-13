import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gif from './assets/gifcash.gif'
const ScrollToTop = ({ children }) => {
  const location = useLocation();
  const [showGif, setShowGif] = useState(true);
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

  useEffect(() => {
    // Resetta lo scroll all'inizio
    window.scrollTo(0, 0);
    
    // Mostra la gif per 5 secondi, poi mostra i children
    setShowGif(true);
    const timer = setTimeout(() => {
      setShowGif(false);
    }, 1500);

    // Cleanup del timer quando cambia il percorso
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {showGif ? (
        <div className='d-flex flex-column justify-content-center align-items-center' style={{width:"100vw", height:"100vh", backgroundColor:"black"}}>
        <img src={gif} alt="Loading..." style={{ width: isMobile ? "500px" : '900px', height: 'auto' }} />
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default ScrollToTop;
