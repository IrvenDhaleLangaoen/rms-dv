// Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EditModal from "../components/EditModal";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import ConfirmationModal from "../components/ConfirmationModal";
import SuccessModal from "../components/SuccessModal"; // Import the SuccessModal
import Table from "../components/Table";

function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [username, setUsername] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryIdToDelete, setEntryIdToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [sortCriteria, setSortCriteria] = useState("");
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");

  const storedUserId = localStorage.getItem("userId");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);

    if (!token) {
      navigate("/login");
    } else {
      axios
        .get("http://192.168.225.229:5000/api/entries", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setEntries(response.data);
        })
        .catch((error) => {
          console.error("Error fetching entries:", error);
        });
    }
  }, [navigate]);


  const handleEditClick = (entry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  const handleUpdate = () => {
    axios.get("http://192.168.225.229:5000/api/entries").then((response) => {
      setEntries(response.data);
    });
  };

  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
  };

  const sortEntries = (entries) => {
    return [...entries].sort((a, b) => {
      const dateA = new Date(a.time_added);
      const dateB = new Date(b.time_added);

      // Sorting by month
      if (sortCriteria === "month") {
        // Compare months only, disregarding the year
        return a.month - b.month; // Sort months in ascending order
      }
      // Sorting by year
      else if (sortCriteria === "year") {
        // Sort by year first, then by month if years are the same
        if (a.year === b.year) {
          return a.month - b.month; // Sort months in ascending order if years are the same
        }
        return a.year - b.year; // Sort years in ascending order
      }

      // Default sorting by time_added (latest to oldest)
      return dateB - dateA; // Keep this as is if you want the default to remain latest to oldest
    });
  };

  const filteredEntries = entries.filter((entry) => {
    const entryMonth = new Date(`${entry.year}-${entry.month}-01`)
      .toLocaleString("default", { month: "long" })
      .toLowerCase();
    const entryYear = entry.year.toString();
    const entryDvNumber = entry.dvNumber.toLowerCase();
    const entryJevNumber = entry.jevNumber.toLowerCase();
    const entryUsername = entry.username.toLowerCase();

    return (
      entryMonth.includes(searchTerm.toLowerCase()) ||
      entryYear.includes(searchTerm) ||
      entryDvNumber.includes(searchTerm.toLowerCase()) ||
      entryJevNumber.includes(searchTerm.toLowerCase()) ||
      entryUsername.includes(searchTerm.toLowerCase())
    );
  });

  const sortedEntries = sortEntries(filteredEntries);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = sortedEntries.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(sortedEntries.length / entriesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleDeletePrompt = (id) => {
    setEntryIdToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://192.168.225.229:5000/api/entries/delete/${storedUserId}/${id}`);
      setEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.id !== id)
      );
      setSuccessMessage("Entry deleted successfully."); // Set success message
      setShowSuccessModal(true); // Show success modal

      // Close the delete modal
      setShowDeleteModal(false); // Close delete confirmation modal

      // Close the success modal after 2 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 1000);
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete the entry.");
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="text-center mt-16">
      <h1 className="text-4xl font-bold font-prodigy text-customGreenDark">
        Welcome to the dashboard, {username}!
      </h1>

      <div className="flex justify-between items-center mt-4">
        <div>
          <label
            htmlFor="sort"
            className="mr-2 font-product text-customGreenDark"
          >
            Sort by:
          </label>
          <select
            id="sort"
            value={sortCriteria}
            onChange={handleSortChange}
            className="border rounded-md p-2 font-product text-customGreenDark border-customGreenDark"
          >
            <option value="">None</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>

        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {sortedEntries.length > 0 ? (
        <div className="mt-8">
          <Table
            entries={currentEntries}
            handleEditClick={handleEditClick}
            handleDeletePrompt={handleDeletePrompt}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
          />
        </div>
      ) : (
        <p className="mt-4 text-lg text-customGreenDark font-product">
          No entries found.
        </p>
      )}

      {showModal && (
        <EditModal
          showModal={showModal}
          onClose={() => setShowModal(false)}
          entry={selectedEntry}
          onUpdate={handleUpdate}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          showModal={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          entryId={entryIdToDelete}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={closeSuccessModal}
          message={successMessage} // Pass the success message
        />
      )}
    </div>
  );
}

export default Dashboard;
