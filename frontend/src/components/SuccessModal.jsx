import React from "react";

const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-center text-green-600 mb-4 font-prodigy">Success!</h2>
        <p className="text-center text-gray-700 mb-6 font-product">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-all duration-300 ease-in-out font-product"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
