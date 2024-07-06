import React, { useState } from "react";
import AdminLogin from "./AdminLogin";
import AdminSetup from "./AdminSetup";
import Dashboard from "./Dashboard";

function InternalLogin({ setLog }) {
    const setAuthorized = (isAuthorized) => {
        setLog(isAuthorized);
    };

    return (
        <div>
            <AdminLogin doLogin={setAuthorized} />
        </div>
    );
}

export default InternalLogin;
