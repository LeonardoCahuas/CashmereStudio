import Bookings from "./Bookings/Bookings"
import Confirm from "./Confirm/Confirm"
import Studios from "./Studios/Studios"
import Users from "./Users/Users"

function Dashboard() {
    return (
        <div>
            <Studios />
            <Confirm/>
            <Bookings/>
            <Users/>
        </div>
    )
}

export default Dashboard