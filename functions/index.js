import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import twilio from 'twilio';

admin.initializeApp();

// Twilio configuration
const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const twilioNumber = functions.config().twilio.number;
const client = twilio(accountSid, authToken);

console.log('Twilio SID:', accountSid);
console.log('Twilio Token:', authToken);
console.log('Twilio Number:', twilioNumber);

// Funzione per inviare messaggio di conferma
export const sendBookingConfirmation = functions.firestore
  .document('prenotazioni/{bookingId}')
  .onCreate((snap) => {
    const booking = snap.data();
    const phoneNumber = booking.telefono;


    // Funzione per formattare la data (giorno, mese, anno)
    const formatDate = (timestamp) => {
      if (!timestamp || !timestamp._seconds) {
        return 'Data non valida';
      }
      const date = new Date(timestamp._seconds * 1000); // converti in millisecondi
      const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      return new Intl.DateTimeFormat('it-IT', options).format(date);
    };

    // Funzione per formattare l'orario (ora, minuti)
    const formatTime = (timestamp) => {
      if (!timestamp || !timestamp._seconds) {
        return 'Orario non valido';
      }
      const date = new Date(timestamp._seconds * 1000); // converti in millisecondi
      return date.toLocaleTimeString('it-IT', { hour: 'numeric', minute: 'numeric', hour12: false });
    };

    const giornoInizio = formatDate(booking.inizio);

    const oraInizio = formatTime(booking.inizio);
    const oraFine = formatTime(booking.fine);

    const message = `La tua prenotazione è confermata per ${giornoInizio} dalle ore ${oraInizio} alle ore ${oraFine} nello studio numero ${booking.studio}.`;

    console.log(message);

    console.log(`Attempting to send message to ${phoneNumber}`);
    console.log(`Message content: ${message}`);

    return client.messages.create({
      body: `[Twilio Test] ${message}`,
      from: twilioNumber,
      to: phoneNumber
    }).then(message => {
      console.log(`Message sent successfully. SID: ${message.sid}`);
    }).catch(error => {
      console.error(`Failed to send message to ${phoneNumber}`);
      console.error('Error details:', error);
    });
  });

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
      const phoneNumber = booking.telefono;
      const message = `Reminder: You have a booking tomorrow at ${new Date(booking.inizio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} at studio ${booking.studio}.`;

      return client.messages.create({
        body: `[Twilio Test] ${message}`,
        from: twilioNumber,
        to: phoneNumber
      });
    });

    await Promise.all(promises);
    console.log('All reminders sent successfully.');
  } catch (error) {
    console.error('Error sending reminders:', error);
  }
});

// Funzione per controllare il login con Google
export const checkGoogleLogin = functions.auth.user().onCreate(async (user) => {
  if (user.providerData && user.providerData.length > 0) {
    const googleProvider = user.providerData.find(provider => provider.providerId === 'google.com');
    if (googleProvider) {
      const { email } = user;
      const authorizedEmails = ['leonardo.cahuas7@gmail.com', 'authorized2@example.com']; // Aggiungi qui gli indirizzi email autorizzati
      if (!authorizedEmails.includes(email)) {
        await admin.auth().revokeRefreshTokens(user.uid);
        await admin.auth().updateUser(user.uid, { disabled: true });
        throw new functions.https.HttpsError('permission-denied', 'Email non autorizzata');
      }
    }
  }
});