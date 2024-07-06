import React, { useState } from 'react';
import QRCode from 'qrcode.react'
import { db } from '../firebase-config'; // Importa la configurazione Firebase
import { doc, setDoc } from "firebase/firestore";

// Funzione per generare bytes casuali usando window.crypto
const generateRandomBytes = (size) => {
  const randomValues = new Uint8Array(size);
  window.crypto.getRandomValues(randomValues);
  return randomValues;
};

// Funzione per convertire bytes casuali in una stringa Base32
const toBase32 = (uint8Array) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let base32 = '';

  for (const byte of uint8Array) {
    bits += byte.toString(2).padStart(8, '0');
  }

  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.substring(i, i + 5);
    base32 += alphabet[parseInt(chunk, 2)];
  }

  return base32;
};

// Funzione per generare un segreto usando la nostra funzione personalizzata
const generateSecret = () => {
  const randomBytes = generateRandomBytes(20); // 20 bytes for a 160-bit key
  return toBase32(randomBytes).slice(0, 32);
};

const AdminSetup = () => {
  const [email, setEmail] = useState(''); // Stato per l'email
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');

  const handleGenerateSecret = () => {
    const newSecret = generateSecret(); // Genera un nuovo segreto usando la nostra funzione personalizzata
    setSecret(newSecret);
    const otpauth = `otpauth://totp/CashmereStudio:${email}?secret=${newSecret}&issuer=CashmereStudio`; // Crea l'URI otpauth
    setQrCode(otpauth); // Imposta l'URI come valore del codice QR
  };

  const handleVerifyCode = async () => {
    const totp = new TOTP(secret); // Usa js-otp per creare un oggetto TOTP
    const isValid = totp.validate(code); // Verifica il codice inserito
    if (isValid) {
      await setDoc(doc(db, "admins", email), { totpSecret: secret }); // Salva il segreto TOTP nel database
      alert('2FA abilitata con successo');
    } else {
      alert('Codice non valido');
    }
  };

  return (
    <div>
      <h2>Abilita 2FA per Admin</h2>
      <input
        type="email"
        placeholder="Inserisci la tua email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleGenerateSecret}>Genera Codice QR</button>
      {qrCode && <QRCode value={qrCode} />} {/* Mostra il codice QR */}
      <input
        type="text"
        placeholder="Inserisci il codice da Google Authenticator"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleVerifyCode}>Verifica Codice</button>
    </div>
  );
};

export default AdminSetup;
