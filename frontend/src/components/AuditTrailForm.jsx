import React, { useEffect, useState } from "react";
import axios from "axios";

const AuditTrailForm = () => {
  const [auditTrail, setAuditTrail] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [filteredAuditTrail, setFilteredAuditTrail] = useState(""); // State for filtered audit trail
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const logsPerPage = 25; // Logs to show per page

  // Fetch the audit trail from the backend
  useEffect(() => {
    axios
      .get("http://192.168.225.229:5000/api/audit")
      .then((response) => {
        const reversedAuditTrail = response.data.auditTrail
          .split("\n")
          .reverse()
          .join("\n")
          .trim(); // Reverse the order of logs and trim any extra spaces/newlines
        setAuditTrail(reversedAuditTrail);
        setFilteredAuditTrail(reversedAuditTrail); // Initialize filtered data
      })
      .catch((error) => {
        console.error("Error fetching audit trail:", error);
      });
  }, []);

  // Filter audit trail based on search query
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredAuditTrail(auditTrail); // If no query, show entire audit trail
    } else {
      const filtered = auditTrail
        .split("\n") // Split by lines
        .filter((line) =>
          line.toLowerCase().includes(searchQuery.toLowerCase())
        ) // Filter lines based on query
        .join("\n")
        .trim(); // Join lines and trim extra spaces/newlines
      setFilteredAuditTrail(filtered);
      setCurrentPage(1); // Reset to first page on new search
    }
  }, [searchQuery, auditTrail]);

  // Get current logs based on the current page
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredAuditTrail
    .split("\n")
    .slice(indexOfFirstLog, indexOfLastLog)
    .join("\n")
    .trim(); // Trim any extra spaces/newlines in the current logs

  // Calculate total pages
  const totalPages = Math.ceil(
    filteredAuditTrail.split("\n").length / logsPerPage
  );

  // Handle page change
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

  return (
    <div className="p-6 min-h-screen flex flex-col items-center font-product text-customGreenDark">
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search audit trail..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-2 border border-customGreenGray rounded-lg w-full max-w-2xl"
      />

      {/* Audit trail logs */}
      <pre className="bg-customWhiteGreen p-4 rounded w-full font-product">
        {currentLogs}
      </pre>

      {/* Pagination controls */}
      <div className="mt-4 flex justify-between w-full max-w-2xl">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="p-2 bg-customGreenDark text-white rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="p-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="p-2 bg-customGreenDark text-white rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AuditTrailForm;
