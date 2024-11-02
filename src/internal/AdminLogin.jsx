import React, { useState } from 'react';
import { auth } from '../firebase-config';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function AdminLogin({ doLogin, setUser }) {
    const [error, setError] = useState(false);
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            setUser(user.email);  // Set email specifically
            doLogin(true);
        } catch (error) {
            doLogin(false);
            setError(true);
            console.error("Errore durante il login con Google: ", error.message);
            alert("Login con Google fallito");
        }
    };

    return (
        <div>
            <h2>Login Google</h2>
            <button onClick={handleGoogleLogin}>Accedi con Google</button>
            {error ? <p className='text-red'>Login non riuscito</p> : null}
        </div>
    );
}

export default AdminLogin;
