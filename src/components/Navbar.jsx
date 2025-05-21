import React, { useState } from 'react';
import { FaUser, FaUserPlus, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Navbar.scss';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Check if token exists in localStorage
  const token = localStorage.getItem('token'); // Replace 'token' with your actual token key

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle navigation to Login page
  const handleLoginClick = () => {
    navigate('/login');
  };

  // Handle navigation to Register page
  const handleRegisterClick = () => {
    navigate('/register');
  };

  // Handle navigation to Profile page
  const handleProfileClick = () => {
    navigate('/profile'); // Replace '/profile' with your actual profile route
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="navbar">
      {/* Left Side: Logo */}
      <div className="navbar-logo">
        <img src="/logo.png" alt="CRM Logo" />
      </div>

      {/* Right Side: Menu and Buttons */}
      <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <div className="navbar-auth">
          {token ? (
            // If token exists, show Profile and Logout
            <>
              <button className="auth-button" onClick={handleProfileClick}>
                <FaUserCircle className="icon" />
                <span>Profile</span>
              </button>
              <button className="auth-button" onClick={handleLogout}>
                <span>Logout</span>
              </button>
            </>
          ) : (
            // If no token, show Login and Register
            <>
              <button className="auth-button" onClick={handleLoginClick}>
                <FaUser className="icon" />
                <span>Login</span>
              </button>
              <button className="auth-button" onClick={handleRegisterClick}>
                <FaUserPlus className="icon" />
                <span>Register</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="navbar-toggle" onClick={toggleMenu}>
        <div className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;