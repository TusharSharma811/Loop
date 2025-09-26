import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react'; // Assuming you use lucide-react for icons

const DropdownMenu = ({ onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener when the component mounts
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteClick = () => {
    onDelete(); // Call the function passed via props
    setIsOpen(false); // Close the dropdown after clicking
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* The button that triggers the dropdown */}
      <button
        onClick={toggleDropdown}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all duration-200"
        title="More options"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {/* The Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={handleDeleteClick}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Chat</span>
            </button>
            {/* You can add more options here */}
            {/* <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Archive className="mr-2 h-4 w-4" />
              <span>Archive Chat</span>
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;