import React, { useState, useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Confirm from '../Confirm/Confirm';
import Bookings from '../Bookings/Bookings';
import Calendar from '../Calendar/Calendar';
import Fonici from '../Fonici/Fonici';

export default function AccordionCashmere() {

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
    return (
        <div className='w-100 d-flex flex-column align-items-center'>
            <div className={`${isMobile ? 'w-100' : 'w-75'}`}>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ArrowDropDownIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                    >
                        Calendario
                    </AccordionSummary>
                    <AccordionDetails>
                        <Calendar />
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ArrowDropDownIcon />}
                        aria-controls="panel2-content"
                        id="panel2-header"
                    >
                        Prenotazioni da approvare
                    </AccordionSummary>
                    <AccordionDetails>
                        <Confirm />
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ArrowDropDownIcon />}
                        aria-controls="panel3-content"
                        id="panel3-header"
                    >
                        Lista prenotazioni
                    </AccordionSummary>
                    <AccordionDetails>
                        <Bookings />
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary
                        expandIcon={<ArrowDropDownIcon />}
                        aria-controls="panel4-content"
                        id="panel4-header"
                    >
                        Gestione fonici
                    </AccordionSummary>
                    <AccordionDetails>
                        <Fonici />
                    </AccordionDetails>
                </Accordion>

            </div>
        </div>
    );
}
