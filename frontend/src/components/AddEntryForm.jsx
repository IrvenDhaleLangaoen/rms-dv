import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaRegPaperPlane, FaRegTrashAlt } from "react-icons/fa";
import ConflictModal from "../components/ConflictModal";
import SuccessModal from "../components/SuccessModal";

const AddEntryForm = () => {
  const [entries, setEntries] = useState([
    {
      month: "",
      year: "",
      dvNumber: "",
      jevNumber: "",
      file: null,
      filePreview: null,
    },
  ]); // State for multiple entries
  const [userId, setUserId] = useState(null); // State for user ID
  const [modalOpen, setModalOpen] = useState(false); // State for modal visibility
  const [modalMessage, setModalMessage] = useState(""); // State for modal message
  const [successModalOpen, setSuccessModalOpen] = useState(false); // Success modal state
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission status

  // Get the user ID from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log(storedUserId);
    if (storedUserId) {
      setUserId(storedUserId); // Set user ID from localStorage
    }
  }, []);

  // Function to handle file and metadata changes for each entry
  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;

    // Automatically add the prefixes when month is changed
    if (field === "month") {
      const monthPrefix = value.padStart(2, "0"); // Ensure month is two digits (e.g., 09 for September)
      updatedEntries[index].dvNumber = `${monthPrefix}-${updatedEntries[
        index
      ].dvNumber.slice(3)}`;
      updatedEntries[index].jevNumber = `${monthPrefix}-00${updatedEntries[
        index
      ].jevNumber.slice(5)}`;
    }

    setEntries(updatedEntries);
  };

  // Handle file preview for each entry (PDF and image)
  const handleFileChange = (index, e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const updatedEntries = [...entries];
      updatedEntries[index].file = selectedFile;

      // Check if the file is a PDF and generate the preview URL accordingly
      if (selectedFile.type === "application/pdf") {
        updatedEntries[index].filePreview = URL.createObjectURL(selectedFile);
      } else {
        updatedEntries[index].filePreview = URL.createObjectURL(selectedFile); // For non-PDF files
      }

      setEntries(updatedEntries);
    }
  };

  // Add a new entry row for additional file and metadata
  const addEntryRow = () => {
    setEntries([
      ...entries,
      {
        month: "",
        year: "",
        dvNumber: "",
        jevNumber: "",
        file: null,
        filePreview: null,
      },
    ]);
  };

  // Remove an entry row
  const removeEntryRow = (index) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      for (const entry of entries) {
        const formData = new FormData();
        formData.append("month", entry.month);
        formData.append("year", entry.year);
        formData.append("dvNumber", entry.dvNumber);
        formData.append("jevNumber", entry.jevNumber);
        formData.append("userId", userId);
        formData.append("file", entry.file);

        // Send each entry to the backend one by one
        await axios.post(
          "http://192.168.225.229:5000/api/entries/add",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setSuccessModalMessage("Entries added successfully!");
      setSuccessModalOpen(true);

      // Automatically close success modal after 1.5 seconds
      setTimeout(() => {
        setSuccessModalOpen(false);
      }, 1500);

      // Reset form fields and file inputs after successful submission
      setEntries([
        {
          month: "",
          year: "",
          dvNumber: "",
          jevNumber: "",
          file: null,
          filePreview: null,
        },
      ]);

      // Clear the file input manually (after form reset)
      document
        .querySelectorAll('input[type="file"]')
        .forEach((input) => (input.value = ""));
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setModalMessage(
          "Error: DV Number or JEV Number already exists for the selected year."
        );
        setModalOpen(true);
      } else {
        console.error(error);
        alert("Failed to add entries.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-prodigy uppercase text-center text-customGreenDark mb-4 mt-4">
        New Entries
      </h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded">
        {entries.map((entry, index) => (
          <div key={index} className="mb-6 border-b pb-4 flex">
            <div className="w-1/2 pr-4">
              <h2 className="text-xl font-prodigy mb-2">Entry {index + 1}</h2>
              <div className="mb-4">
                <label className="block text-customGreenGray font-product">
                  Upload File:
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(index, e)} // Ensure this handler is connected properly
                  className="mt-1 block w-full p-2 border border-customGreenGray rounded font-product"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-customGreenGray font-product">
                  Month:
                </label>
                <select
                  value={entry.month}
                  onChange={(e) =>
                    handleEntryChange(index, "month", e.target.value)
                  }
                  className="mt-1 block w-full p-2 border-customGreenGray border text-customGreenDark rounded font-product"
                  required
                >
                  <option
                    value=""
                    disabled
                    className="font-product text-customGreenDark"
                  >
                    Select Month
                  </option>
                  <option
                    value="1"
                    className="font-product text-customGreenDark"
                  >
                    January
                  </option>
                  <option
                    value="2"
                    className="font-product text-customGreenDark"
                  >
                    February
                  </option>
                  <option
                    value="3"
                    className="font-product text-customGreenDark"
                  >
                    March
                  </option>
                  <option
                    value="4"
                    className="font-product text-customGreenDark"
                  >
                    April
                  </option>
                  <option
                    value="5"
                    className="font-product text-customGreenDark"
                  >
                    May
                  </option>
                  <option
                    value="6"
                    className="font-product text-customGreenDark"
                  >
                    June
                  </option>
                  <option
                    value="7"
                    className="font-product text-customGreenDark"
                  >
                    July
                  </option>
                  <option
                    value="8"
                    className="font-product text-customGreenDark"
                  >
                    August
                  </option>
                  <option
                    value="9"
                    className="font-product text-customGreenDark"
                  >
                    September
                  </option>
                  <option
                    value="10"
                    className="font-product text-customGreenDark"
                  >
                    October
                  </option>
                  <option
                    value="11"
                    className="font-product text-customGreenDark"
                  >
                    November
                  </option>
                  <option
                    value="12"
                    className="font-product text-customGreenDark"
                  >
                    December
                  </option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-customGreenGray font-product">
                  Year:
                </label>
                <select
                  value={entry.year}
                  onChange={(e) =>
                    handleEntryChange(index, "year", e.target.value)
                  }
                  className="mt-1 block w-full p-2 border border-customGreenGray font-product rounded"
                  required
                >
                  <option
                    value=""
                    disabled
                    className="font-product text-customGreenDark"
                  >
                    Select Year
                  </option>
                  <option
                    value="2022"
                    className="font-product text-customGreenDark"
                  >
                    2022
                  </option>
                  <option
                    value="2023"
                    className="font-product text-customGreenDark"
                  >
                    2023
                  </option>
                  <option
                    value="2024"
                    className="font-product text-customGreenDark"
                  >
                    2024
                  </option>
                  <option
                    value="2025"
                    className="font-product text-customGreenDark"
                  >
                    2025
                  </option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-customGreenGray font-product">
                  DV Number:
                </label>
                <input
                  type="text"
                  value={entry.dvNumber}
                  onChange={(e) =>
                    handleEntryChange(index, "dvNumber", e.target.value)
                  }
                  className="mt-1 block w-full p-2 border border-customGreenGray rounded font-product text-customGreenDark"
                  required
                  placeholder="DV Number"
                />
              </div>
              <div className="mb-4">
                <label className="block text-customGreenGray font-product">
                  JEV Number:
                </label>
                <input
                  type="text"
                  value={entry.jevNumber}
                  onChange={(e) =>
                    handleEntryChange(index, "jevNumber", e.target.value)
                  }
                  className="mt-1 block w-full p-2 border border-customGreenGray text-customGreenDark font-product rounded"
                  required
                  placeholder="JEV Number"
                />
              </div>
              {/* Remove entry button */}
              {index > 0 && (
                <button
                  type="button"
                  className="font-product flex items-center bg-red-400 p-2 rounded text-white"
                  onClick={() => removeEntryRow(index)}
                >
                  <FaRegTrashAlt className="mr-2" />
                  Remove Entry
                </button>
              )}
            </div>

            {/* PDF Preview Section */}
            <div className="w-1/2 pl-4">
              {entry.filePreview && entry.file.type === "application/pdf" ? (
                <iframe
                  src={entry.filePreview}
                  title={`Preview ${index + 1}`}
                  className="w-full h-full border rounded"
                />
              ) : (
                entry.filePreview && (
                  <img
                    src={entry.filePreview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-contain border rounded"
                  />
                )
              )}
            </div>
          </div>
        ))}

        {/* Add new entry button */}
        <div className="flex item-center">
          <button
            type="button"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2"
            onClick={addEntryRow}
          >
            <FaPlus className="text-white" />
          </button>

          <button
            type="submit"
            className={`font-product bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-4 flex items-center ${
              isSubmitting ? "opacity-50" : ""
            }`}
            disabled={isSubmitting}
          >
            <FaRegPaperPlane className="text-white mr-4" />
            Submit
          </button>
        </div>
      </form>

      {/* Conflict Modal */}
      {modalOpen && (
        <ConflictModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          message={modalMessage}
        />
      )}

      {/* Success Modal */}
      {successModalOpen && (
        <SuccessModal isOpen={successModalOpen} message={successModalMessage} />
      )}
    </div>
  );
};

export default AddEntryForm;
