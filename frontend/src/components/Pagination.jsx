import React from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";

const Pagination = ({ currentPage, totalPages, onNextPage, onPreviousPage }) => {
  return (
    <div className="flex justify-between items-center mt-4">
      {/* Use invisible instead of removing the button to maintain space */}
      <button
        onClick={onPreviousPage}
        className={`px-4 py-2 bg-gray-300 rounded font-product text-customGreenDark ${
          currentPage === 1 ? 'invisible' : ''
        }`}
      >
        <FaArrowLeft />
      </button>
      <span className="font-product text-customGreenDark flex-grow text-center">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages && (
        <button
          onClick={onNextPage}
          className="px-4 py-2 bg-gray-300 rounded font-prodigy uppercase text-customGreenDark"
        >
          <FaArrowRight />
        </button>
      )}
    </div>
  );
};

export default Pagination;
