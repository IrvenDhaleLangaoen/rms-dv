import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utilities/AuthContext";
import LogoutModal from "./LogoutModal";
import Sidebar from "./Sidebar"; // Import the new Sidebar component

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [username, setUsername] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <nav className="bg-customGreenDark p-4 flex justify-between items-center sticky top-0">
        {isLoggedIn && (
          <button className="text-customMint focus:outline-none" onClick={toggleSidebar}>
            {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        )}

        {/* <ul className="flex space-x-4">
          {!isLoggedIn && (
            <>
              <li>
                <Link to="/login" className="font-semibold text-customWhiteGreen hover:bg-customGreenGray p-1.5">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="font-semibold text-customWhiteGreen hover:bg-customGreenGray p-1.5">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul> */}

        {isLoggedIn && (
          <div className="flex items-center">
            <h3 className="text-customWhiteGreen mr-4 font-semibold">Hello, {username}!</h3>
          </div>
        )}
      </nav>

      {/* Sidebar component */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        openLogoutModal={openLogoutModal}
        isLoggedIn={isLoggedIn}
      />

      {showLogoutModal && (
        <LogoutModal onConfirm={handleLogout} onCancel={closeLogoutModal} />
      )}
    </>
  );
};

export default Navbar;
