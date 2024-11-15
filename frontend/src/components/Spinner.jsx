// Spinner.jsx
import React from 'react';

const Spinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin border-4 border-t-4 border-t-customMint border-customGreenGray rounded-full h-12 w-12"></div>
    </div>
  );
};

export default Spinner;
