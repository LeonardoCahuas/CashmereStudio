import React, { useEffect, useState } from "react";
import AdminLogin from "./AdminLogin";
import AdminSetup from "./AdminSetup";
import Dashboard from "./Dashboard";

function InternalLogin({ setLog, setMail }) {
    const [user, setUser] = useState("");

    const setAuthorized = (isAuthorized) => {
        setLog(isAuthorized);
    };

    const setCurrentUser = (currentUser) => {
        setUser(currentUser);  // Set the user
        setMail(currentUser);  // Immediately set mail
    };

    useEffect(() => {
        if (user !== "") {
            setMail(user);  // Redundant, but keeps for ensuring updates in async cases
        }
    }, [user]);

    return (
        <div>
            <AdminLogin doLogin={setAuthorized} setUser={setCurrentUser} />
        </div>
    );
}


export default InternalLogin;
