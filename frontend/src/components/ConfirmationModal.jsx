import React from 'react';

const ConfirmationModal = ({ 
  showModal, 
  onClose, 
  onConfirm, 
  entryId, 
  title = "Confirm Deletion", 
  message = "Are you sure you want to delete this entry?", 
  confirmText = "Delete", 
  cancelText = "Cancel", 
  isProcessing = false 
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h2 className="text-xl font-prodigy text-center text-customGreenDark mb-6">
          {title}
        </h2>
        <p className="text-center text-gray-700 mb-4 font-product">
          {message}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => onConfirm(entryId)}
            className={`${
              isProcessing ? 'bg-red-300' : 'bg-red-500'
            } text-white font-product px-6 py-2 rounded-full hover:bg-red-600 transition-all duration-300 ease-in-out`}
            disabled={isProcessing} // Disable during processing
          >
            {isProcessing ? 'Processing...' : confirmText}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-customGreenDark font-product px-6 py-2 rounded-full hover:bg-gray-400 transition-all duration-300 ease-in-out "
            disabled={isProcessing} // Disable during processing
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
