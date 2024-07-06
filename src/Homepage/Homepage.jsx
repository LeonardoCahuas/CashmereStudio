import Header from "../components/Header/Header"
import Navbar from "../components/Navbar/Navbar"
import Services from "./Services"
import Studios from "./Studios"

function Homepage() {
    return (
        <div className="bg-black" style={{paddingTop:"00px"}}>
            
            <Header/>
            <Studios/>
            <Services/>
        </div>
    )
}

export default Homepage