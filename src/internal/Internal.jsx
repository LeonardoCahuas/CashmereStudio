import { useState } from "react"
import Dashboard from "./Dashboard"
import InternalLogin from "./InternalLogin"

function Internal() {
    const [logged, setLogged] = useState(false)

    const isLogged = (isLog)=> {
        setLogged(isLog)
    }
    return (
        <div style={{paddingTop: "100px"}}>
            {
                logged
                    ?
                    <Dashboard/>
                    :
                    <InternalLogin setLog={isLogged}/>
            }
        </div>
    )
}

export default Internal