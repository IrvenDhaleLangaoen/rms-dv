//logout modal ko to kuys

import React from "react";

const LogoutModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h2 className="text-xl font-prodigy text-center text-customGreenDark mb-6">
          Are you sure you want to log out?
        </h2>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white font-product px-6 py-2 rounded-full hover:bg-red-600 transition-all duration-300 ease-in-out"
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 text-customGreenDark font-product px-6 py-2 rounded-full hover:bg-gray-400 transition-all duration-300 ease-in-out"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
