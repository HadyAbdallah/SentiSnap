import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css"; // Import your CSS file for Navbar styling
import { useUser } from '../../contexts/UserContext'; // Import the useUser hook

export default function Navbar() {
  const navigate = useNavigate();
  const { logout } = useUser(); // Get the login function from context
  //& Start Function to Log out
  const HandleLogout = () => {
    logout();
    // navigate("/signin");
  }
  //& End Function to Log out


  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef]);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg position-fixed top-0 w-100 ${isScrolled ? "scrolled" : ""
          }`}
      >
        <div className="container">
          <Link className="navbar-brand" to="/home">
            <div className="logo">
              Senti<span className="halfLogo">Snap</span>
            </div>
            <img
              className="logoImg"
              src={require("../../assets/imgs/sentiment-analysis.png")}
              alt="logo"
            />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav m-auto mb-2 mb-lg-0">
              <li className="nav-item navnav">
                <NavLink className="nav-link" aria-current="page" to={"/home"}>
                  Home
                </NavLink>
              </li>
              <li className="nav-item navnav">
                <NavLink
                  className="nav-link "
                  aria-current="page"
                  to={"/analysis"}
                >
                  Analysis
                </NavLink>
              </li>
              <li className="nav-item navnav">
                <NavLink className="nav-link" to={"/top10"}>
                  Top10
                </NavLink>
              </li>
              <li className="nav-item navnav">
                <NavLink className="nav-link" to={"/posts"}>
                  Posts
                </NavLink>
              </li>
              <li className="nav-item navnav">
                <NavLink className="nav-link" to={"/search"}>
                  Search
                </NavLink>
              </li>
            </ul>
            <div className="dropdown" ref={profileMenuRef}>
              <div
                className="profile"
                onClick={toggleProfileMenu}
              >
                <span className="profileName">
                  <i class="fa-solid fa-user"></i>
                </span>
              </div>
              <ul
                className={`dropdown-menu ${isProfileMenuOpen ? "show" : ""}`}
              >
                <li className="first">
                  <Link className="dropLinks " to="/history">History</Link>
                </li>
                <li>
                  <Link className="dropLinks" onClick={HandleLogout}>Logout</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
