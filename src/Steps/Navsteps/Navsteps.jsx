import logo from "../../assets/rock.jpg"

function Navsteps(){
    return(
        <div className="d-flex flex-row justify-content-between p-3 bg-white">
          <img src={logo} style={{width:"100px"}} alt=""/>
          <a className="text-black" style={{textDecoration:"underline"}}>Vai al sito web</a>
        </div>
    )
}
export default Navsteps