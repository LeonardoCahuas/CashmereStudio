import React, { useState } from 'react';
import { auth } from '../firebase-config';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function AdminLogin({ doLogin }) {
    const [error, setError] = useState(false);

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            console.log(result);
            const user = result.user;
            doLogin(true);
            alert('Login riuscito');
            // Reindirizza al pannello di amministrazione
        } catch (error) {
            doLogin(false);
            setError(true);
            console.error("Errore durante il login con Google: ", error.message);
            alert("Login con Google fallito");
        }
    };

    return (
        <div>
            <h2>Login Amministratore</h2>
            <button onClick={handleGoogleLogin}>Accedi con Google</button>
            {error ? <p className='text-red'>Login non riuscito</p> : null}
        </div>
    );
}

export default AdminLogin;
