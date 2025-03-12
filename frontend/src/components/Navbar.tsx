import { FaPlus, FaReddit, FaUser, FaSignInAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import CreateDropdown from "./CreateDowndown";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const { currentUser, isAuthenticated, loading, logout } = useAuth();

  useEffect(() => {
    console.log("Navbar auth state:", { isAuthenticated, currentUser });
  }, [isAuthenticated, currentUser]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Rendering logic
  if (loading) {
    return (
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo-container">
            <FaReddit className="reddit-icon" />
            <span className="site-name">reddit</span>
          </div>
          <div className="nav-actions">
            <p>Loading...</p>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo-link">
          <div className="logo-container">
            <FaReddit className="reddit-icon" />
            <span className="site-name">reddit</span>
          </div>
        </Link>
        <SearchBar />
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <div className="dropdown-container">
                <button
                  className="icon-button"
                  onClick={() => setShowDropdown(true)}
                  title="Create Post"
                >
                  <FaPlus />
                </button>
                {showDropdown && (
                  <CreateDropdown
                    isOpen={showDropdown}
                    onClose={() => setShowDropdown(false)}
                  />
                )}
              </div>
              <button
                className="icon-button"
                onClick={() => navigate(`/u/${currentUser?.username}`)}
                title="View Profile"
              >
                <FaUser />
              </button>
              <button className="login-button" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <div className="auth-buttons">
              <button
                className="login-button"
                onClick={() => navigate("/login")}
              >
                <FaSignInAlt /> Log In
              </button>
              <button
                className="signup-button"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;