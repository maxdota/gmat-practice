import { Link } from "react-router-dom"

const Navbar = () => {
  return (
    <div className="nav-top">
      <a href="/" className="nav-label"><b>GMAT PRACTICE</b></a>
      <a href="/input-description"><img className="nav-image" src={process.env.PUBLIC_URL + "/icon_key.png"}/></a>
    </div>
  )
}
export default Navbar;