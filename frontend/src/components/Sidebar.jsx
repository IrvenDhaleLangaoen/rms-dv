//sidebar ko to kuys

import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaPlus, FaHome, FaFileAlt } from "react-icons/fa"; // Import FaFileAlt for audit trail icon
import axios from "axios";
import LogoutModal from "./LogoutModal"; // Import the LogoutModal component

const Sidebar = ({ isOpen, toggleSidebar, isLoggedIn }) => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // State to handle logout modal visibility

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleSidebar();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, toggleSidebar]);

  const handleLogout = async () => {
    try {
      const username = localStorage.getItem("username");

      // Ensure the username exists before proceeding
      if (!username) {
        console.error("No username found for logout.");
        return;
      }

      // Call the backend API to log out
      await axios.post("http://192.168.225.229:5000/api/auth/signoff", {
        username,
      });

      // Clear token and user info from localStorage
      localStorage.clear();

      // Reload the page after logout
      window.location.reload();

      // Optionally, navigate to the login page (this will be redundant if the page reloads)
      // navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Open the logout modal
  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  // Close the logout modal
  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  // Handle logout confirmation
  const confirmLogout = () => {
    handleLogout(); // Perform the logout
    closeLogoutModal(); // Close the modal
    toggleSidebar(); // Close the sidebar
  };

  return (
    <>
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 w-64 bg-customMint h-full z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="p-4 text-customGreenDark font-bold text-xl text-center font-prodigy uppercase">
          Sidebar Title {/* Replace with your desired title */}
        </div>
        <hr className="border-customGreenDark mx-8" /> {/* Add a line below */}
        <ul className="p-4 text-[#2D3142] space-y-4">
          {isLoggedIn && (
            <>
              <li>
                <div
                  className="p-2 hover:bg-customWhiteGreen rounded w-full transition duration-300 ease-in-out"
                  onClick={toggleSidebar}
                >
                  <Link to="/dashboard" className="flex items-center">
                    <FaHome className="inline mr-4" />
                    <span className="font-product">Dashboard</span>
                  </Link>
                </div>
              </li>
              <li>
                <div
                  className="p-2 hover:bg-customWhiteGreen rounded w-full transition duration-300 ease-in-out"
                  onClick={toggleSidebar}
                >
                  <Link to="/add-entry" className="flex items-center">
                    <FaPlus className="inline mr-4" />
                    <span className="font-product">New Entry</span>
                  </Link>
                </div>
              </li>
              <li>
                <div
                  className="p-2 hover:bg-customWhiteGreen rounded w-full transition duration-300 ease-in-out"
                  onClick={toggleSidebar}
                >
                  <Link to="/audit-trail" className="flex items-center">
                    {" "}
                    {/* Link to the audit trail */}
                    <FaFileAlt className="inline mr-4" />
                    <span className="font-product">Audit Trail</span>
                  </Link>
                </div>
              </li>
              <li>
                <div
                  className="p-2 hover:bg-customWhiteGreen rounded w-full transition duration-300 ease-in-out"
                  onClick={openLogoutModal} // Open the logout modal on click
                >
                  <Link to="#" className="flex items-center">
                    <FaSignOutAlt className="inline mr-4" />
                    <span className="font-product">Logout</span>
                  </Link>
                </div>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <LogoutModal
          onConfirm={confirmLogout} // Trigger the logout when confirmed
          onCancel={closeLogoutModal} // Close modal on cancel
        />
      )}
    </>
  );
};

export default Sidebar;
