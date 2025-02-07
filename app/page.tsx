"use client";

import { useState } from "react";
import Navbar from "@/components/navbar/page";
import Sidebar from "@/components/main/Sidebar";
import ServiceCategory from "@/components/main/AddServiceCate";
import ServiceList from "@/components/main/SeviceList";
import AddService from "@/components/main/AddService";
import BookAppointMent from "@/components/main/BookAppointMent";

export default function Home() {
  const [selectedOption, setSelectedOption] = useState("AddServiceCate");

  // Function to render content based on selection
  const renderContent = () => {
    switch (selectedOption) {
      case "AddServiceCate":
        return <ServiceCategory/>;
      case "AddService":
        return <AddService/>;
      case "serviceList":
        return <ServiceList/>;
      case "BookAppointMent":
        return <BookAppointMent/>;
      default:
        return <h1 className="text-2xl font-bold">🏠 Home Page</h1>;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar at the top */}
      <Navbar />
      
      <div className="flex flex-1">
        {/* Sidebar on the left */}
        <Sidebar onSelectOption={setSelectedOption} />

        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
