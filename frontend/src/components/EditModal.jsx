import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import SuccessModal from "./SuccessModal"; // Import the SuccessModal
import Spinner from "./Spinner"; // Import the Spinner component

const EditModal = ({ showModal, onClose, entry, onUpdate }) => {
  const [formData, setFormData] = useState({
    month: entry?.month || "",
    year: entry?.year || "",
    dvNumber: entry?.dvNumber || "",
    jevNumber: entry?.jevNumber || "",
    filePath: entry?.filePath || "",
    userId: localStorage.getItem("userId"),
  });

  const storedUserId = localStorage.getItem("userId");

  const [filePreview, setFilePreview] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
  const [isLoading, setIsLoading] = useState(false); // State for loading

  useEffect(() => {
    if (entry?.dvNumber) {
      axios
        .get(`http://192.168.225.229:5000/api/entries/view/${storedUserId}/${entry.dvNumber}`, {
          responseType: "blob", // Set response type to blob to handle files
        })
        .then((response) => {
          const fileURL = URL.createObjectURL(response.data);
          setFilePreview(fileURL); // Set the preview to the fetched file
        })
        .catch((error) => {
          console.error("Error fetching the file preview:", error);
        });
    }
  }, [entry?.dvNumber]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    // Create a regular JavaScript object instead of FormData
    const sendFormData = {
      dvNumber: formData.dvNumber,
      jevNumber: formData.jevNumber,
      filePath: formData.filePath,
      userId: formData.userId,
    };

    // Log the form data for debugging
    console.log(sendFormData);

    // Send the data as JSON
    axios
      .put(`http://192.168.225.229:5000/api/entries/edit/${storedUserId}/${entry.id}`, sendFormData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          onUpdate();
          onClose();
        }, 1000);
      })
      .catch((error) => {
        console.error("Error updating entry:", error);
      })
      .finally(() => {
        setIsLoading(false); // Stop loading
      });
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md w-2/3 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-prodigy text-customGreenDark">
              Edit {entry.dvNumber}
            </h2>
            <button onClick={onClose}>
              <FaTimes className="text-xl" />
            </button>
          </div>
          {isLoading ? ( // Show loading spinner while loading
            <div className="flex items-center justify-center h-40">
              <Spinner /> {/* Spinner component */}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4 flex items-center">
                <label className="w-1/4 text-sm text-customGreen font-product">
                  Month
                </label>
                <input
                  type="text"
                  name="month"
                  value={monthNames[formData.month - 1] || ""}
                  className="w-3/4 p-2 border border-customGreenGray rounded ml-2 text-customGreenGray font-product"
                  required
                  readOnly
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="w-1/4 text-sm text-customGreen font-product">
                  Year
                </label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  className="w-3/4 p-2 border border-customGreenGray rounded ml-2 text-customGreenGray font-product"
                  required
                  readOnly
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="w-1/4 text-sm text-customGreen font-product">
                  DV Number
                </label>
                <input
                  type="text"
                  name="dvNumber"
                  value={formData.dvNumber}
                  onChange={handleChange}
                  className="w-3/4 p-2 border ml-2 border-customGreenGray rounded text-customGreenDark font-product"
                  required
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="w-1/4 text-sm text-customGreen font-product">
                  JEV Number
                </label>
                <input
                  type="text"
                  name="jevNumber"
                  value={formData.jevNumber}
                  onChange={handleChange}
                  className="w-3/4 p-2 border ml-2 border-customGreenGray rounded text-customGreenDark font-product"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md font-product"
                >
                  Update Entry
                </button>
              </div>
            </form>
          )}
        </div>
        <div className="ml-4 w-full max-w-2xl flex items-center justify-center">
          {filePreview && (
            <div className="mb-4">
              <h2 className="text-lg font-prodigy mb-2 text-center font-prodigy text-customGreenDark">
                File Preview:
              </h2>
              <div className="ml-4 w-full max-w-2xl flex items-center justify-center">
                {entry?.dvNumber && (
                  <div className="mb-4">
                    <embed
                      src={`http://192.168.225.229:5000/api/entries/view/${storedUserId}/${entry.dvNumber}`}
                      type="application/pdf"
                      width="650px"
                      height="470px"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Entry has been successfully updated."
      />
    </div>
  );
};

export default EditModal;
