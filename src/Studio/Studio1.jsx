import Footer from "../components/Footer/Footer"
import Navbar from "../components/Navbar/Navbar"
import Services from "../Homepage/Services"
import StudioDetails from "./StudioDetails"

function Studio1() {
    return (
        <div>
            <StudioDetails index={1} />
            <div style={{ borderTop: "1px solid #cdcdcd" }} className="w-100 d-flex flex-column align-items-center justofy-content-center">
                <Services />
            </div>
        </div>
    )
}
export default Studio1