import Header from "../components/Header/Header"
import Navbar from "../components/Navbar/Navbar"
import Paragraph from "./Paragraph"
import Services from "./Services"
import Studios from "./Studios"

function Homepage() {
    return (
        <div className="bg-white" style={{paddingTop:"00px"}}>
            
            <Header/>
            <Paragraph/>
            <Studios/>
            <Services/>
        </div>
    )
}

export default Homepage