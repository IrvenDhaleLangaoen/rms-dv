// src/components/SearchBar.jsx
import React from 'react';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="mt-4 font-product text-customGreenDark">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded-md p-2 border-customGreenDark"
      />
    </div>
  );
};

export default SearchBar;
