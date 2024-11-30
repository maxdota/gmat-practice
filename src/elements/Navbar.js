import { Link } from "react-router-dom"

const Navbar = () => {
  return (
    <div className="nav-top">
      <img className="logo-image" src={ process.env.PUBLIC_URL + "/logo_invert.png" }/>
      <a href={ process.env.REACT_APP_URL_PREFIX } className="nav-label"><b>GMAT FOX</b></a>
      {/*<a href={ process.env.REACT_APP_URL_PREFIX + "/input-description" }>*/}
      {/*  <img className="nav-image" src={ process.env.PUBLIC_URL + "/icon_key.png" }/>*/}
      {/*</a>*/}
    </div>
  )
}
export default Navbar;