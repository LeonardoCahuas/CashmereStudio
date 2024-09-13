import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import twilio from 'twilio'; // Importa Twilio

admin.initializeApp();

// Configurazione Twilio
const twilioAccountSid = functions.config().twilio.sid; // SID dell'account Twilio
const twilioAuthToken = functions.config().twilio.token; // Token di autenticazione Twilio
const twilioPhoneNumber = functions.config().twilio.number; // Numero di telefono Twilio

const twilioClient = twilio(twilioAccountSid, twilioAuthToken); // Inizializza il client Twilio

// Funzione per formattare la data (giorno, mese, anno)
const formatDate = (timestamp) => {
  if (!timestamp || !timestamp._seconds) {
    return 'Data non valida';
  }
  const date = new Date(timestamp._seconds * 1000);
  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  // Formatta la data e sostituisci gli spazi con '+'
  return new Intl.DateTimeFormat('it-IT', options).format(date).replace(/ /g, '+');
};

// Funzione per formattare l'orario (ora, minuti)
const formatTimeWithTimezone = (timestamp) => {
  if (!timestamp || !timestamp._seconds) {
    return 'Orario non valido';
  }
  const date = new Date(timestamp._seconds * 1000); // converti in millisecondi
  return date.toLocaleTimeString('it-IT', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: 'Europe/Rome' });
};

// Funzione per inviare messaggio di conferma
export const sendBookingConfirmation = functions.firestore
  .document('prenotazioni/{bookingId}')
  .onCreate((snap) => {
    const booking = snap.data();

    // Controlla se prenotatoDa è uguale a "gestionale"
    if (booking.prenotatoDa == "gestionale") {
      console.log('Nessun messaggio inviato: prenotazione effettuata da gestionale.');
      return null; // Esci dalla funzione senza inviare messaggi
    }

    const phoneNumber = `${booking.telefono}`; // Il numero di telefono del cliente
    const studioPhoneNumber = '+393383931206'; // Numero dello studio

    const giornoInizio = formatDate(booking.inizio);
    const oraInizio = formatTimeWithTimezone(booking.inizio);
    const oraFine = formatTimeWithTimezone(booking.fine);

    // Messaggio per il cliente
    const clientMessage = `Prenotazione confermata per ${giornoInizio} dalle ore ${oraInizio} alle ore ${oraFine} nello studio ${booking.studio}.`;

    const studioMessage = `Richiesta prenotazione. Chat con il cliente: https://wa.me/${booking.telefono}?text=Ciao+${booking.nomeUtente},+abbiamo+ricevuto+una+prenotazione+il+giorno+${formatDate(booking.inizio)}+dalle+${formatTimeWithTimezone(booking.inizio)}+alle+${formatTimeWithTimezone(booking.fine)}+con+servizi+${booking.services.join(',')}`;
    // Invia il messaggio al cliente
    return twilioClient.messages.create({
      body: clientMessage,
      from: twilioPhoneNumber,
      to: phoneNumber
    })
    .then(() => {
      // Invia il messaggio allo studio
      return twilioClient.messages.create({
        body: studioMessage,
        from: twilioPhoneNumber,
        to: studioPhoneNumber
      });
    })
    .then(() => {
      console.log(`Messaggi inviati con successo a ${phoneNumber} e ${studioPhoneNumber}`);
    })
    .catch(error => {
      console.error(`Errore nell'invio dei messaggi:`, error);
    });
  });

// Funzione per inviare promemoria
export const sendReminder = functions.pubsub.schedule('0 18 * * *').timeZone('Europe/Rome').onRun(async () => {
  const db = admin.firestore();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  try {
    const snapshot = await db.collection('prenotazioni')
      .where('inizio', '>=', new Date(`${dateStr}T00:00:00Z`))
      .where('inizio', '<', new Date(`${dateStr}T23:59:59Z`))
      .get();

    const promises = snapshot.docs.map(doc => {
      const booking = doc.data();
      const phoneNumber = `${booking.telefono}`; // Il numero di telefono del cliente
      const oraInizio = formatTimeWithTimezone(booking.inizio); // Utilizza la funzione di formattazione

      const message = `Reminder: Hai un appuntamento domani alle ${oraInizio} presso lo studio ${booking.studio}.`;

      // Invia il messaggio al cliente
      return twilioClient.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: phoneNumber
      });
    });

    await Promise.all(promises);
    console.log('Tutti i promemoria inviati con successo.');
  } catch (error) {
    console.error('Errore nell\'invio dei promemoria:', error);
  }
});