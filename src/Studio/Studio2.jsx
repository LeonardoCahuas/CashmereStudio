import Footer from "../components/Footer/Footer"
import Navbar from "../components/Navbar/Navbar"
import Services from "../Homepage/Services"
import StudioDetails from "./StudioDetails"

function Studio2() {
    return (
        <div>
            <StudioDetails index={2}/>
            <Services/>
        </div>
    )
}
export default Studio2