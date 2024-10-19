import { useEffect, useState } from "react"
import Dashboard from "./Dashboard"
import InternalLogin from "./InternalLogin"

function Internal() {
    const [logged, setLogged] = useState(false);
    const [user, setUser] = useState("");

    const isLogged = (isLog) => {
        setLogged(isLog);
    };

    useEffect(() => {
        console.log(user);  // You should now see the user email logged
    }, [user]);

    return (
        <div style={{ paddingTop: "100px" }}>
            {logged ? <Dashboard user={user} /> : <InternalLogin setLog={isLogged} setMail={setUser} />}
        </div>
    );
}


export default Internal