import React from "react";
import { Home, Info, List, Phone } from "lucide-react"; // Import icons

interface SidebarProps {
  onSelectOption: (option: string) => void;
}

export default function Sidebar({ onSelectOption }: SidebarProps) {
  return (
    <div className="w-70 h-screen bg-gray-900 text-white shadow-lg fixed left-0 top-0 p-6 z-20">
      <h2 className="text-xl font-semibold mb-6 pb-6 text-center">Admin Panel</h2>
      <ul className="space-y-4">
        <li>
          <button
            onClick={() => onSelectOption("AddServiceCate")}
            className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition duration-300"
          >
            <Home size={20} />
            <span>Add Service Category</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => onSelectOption("AddService")}
            className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition duration-300"
          >
            <Info size={20} />
            <span>Add Service</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => onSelectOption("serviceList")}
            className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition duration-300"
          >
            <List size={20} />
            <span>Services</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => onSelectOption("BookAppointMent")}
            className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition duration-300"
          >
            <Phone size={20} />
            <span>Booking Appointment</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
