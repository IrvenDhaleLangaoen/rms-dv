// Table.jsx
import { BsDownload, BsFeather, BsEye, BsTrash } from "react-icons/bs";

function Table({ entries, handleEditClick, handleDeletePrompt }) {
  const storedUserId = localStorage.getItem("userId");
  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b font-prodigy uppercase text-customGreenDark">
            Month
          </th>
          <th className="py-2 px-4 border-b font-prodigy uppercase text-customGreenDark">
            Year
          </th>
          <th className="py-2 px-4 border-b font-prodigy uppercase text-customGreenDark">
            DV Number
          </th>
          <th className="py-2 px-4 border-b font-prodigy uppercase text-customGreenDark">
            JEV Number
          </th>
          <th className="py-2 px-4 border-b font-prodigy uppercase text-customGreenDark">
            Added by
          </th>
          <th className="py-2 px-4 border-b font-prodigy uppercase text-customGreenDark">
            Time Added
          </th>
          <th className="py-2 px-4 border-b font-prodigy uppercase text-customGreenDark">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.id}>
            <td className="py-2 px-4 border-b font-product text-customGreenDark">
              {new Date(`${entry.year}-${entry.month}-01`).toLocaleString(
                "default",
                { month: "long" }
              )}
            </td>
            <td className="py-2 px-4 border-b font-product text-customGreenDark">
              {entry.year}
            </td>
            <td className="py-2 px-4 border-b font-product text-customGreenDark">
              {entry.dvNumber}
            </td>
            <td className="py-2 px-4 border-b font-product text-customGreenDark">
              {entry.jevNumber}
            </td>
            <td className="py-2 px-4 border-b font-product text-customGreenDark">
              {entry.username}
            </td>
            <td className="py-2 px-4 border-b font-product text-customGreenDark">
              {new Date(entry.time_added).toLocaleString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true, // Change to false for 24-hour format
              })}
            </td>
            <td className="py-2 px-4 border-b">
              <a
                href={`http://192.168.225.229:5000/api/entries/view/${storedUserId}/${entry.dvNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-green-300 rounded-md mr-1 inline-flex items-center justify-center"
              >
                <BsEye />
              </a>
              <button
                className="p-2 bg-yellow-300 rounded-md mr-1"
                onClick={() => handleEditClick(entry)}
              >
                <BsFeather />
              </button>

              <a
                href={`http://192.168.225.229:5000/api/entries/download/${storedUserId}/${entry.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-cyan-300 rounded-md mr-1 inline-flex items-center justify-center"
              >
                <BsDownload />
              </a>
              <button
                className="p-2 bg-red-300 rounded-md"
                onClick={() => {
                  console.log("Delete button clicked for ID:", entry.id);
                  handleDeletePrompt(entry.id);
                }}
              >
                <BsTrash />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
