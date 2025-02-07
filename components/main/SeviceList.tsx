"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

interface ServiceCategory {
  id: number;
  name: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  categoryId: number;
}

interface BookingData {
  date: string;
  time: string;
  bookedAt: string;
  serviceName: string;
  userId: string;
  userEmail: string;
  userName: string;
}

const ServiceList = () => {
  const { user } = useUser();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const getDates = (startDate: Date = new Date()) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dayNumber: date.getDate()
      });
    }
    return dates;
  };

  const getTimeSlots = (selectedDate: Date | null) => {
    if (!selectedDate) return [];
    
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();

    const slots = [];
    const startHour = 10; // 10 AM
    const endHour = 14; // 2 PM

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minutes of [0, 30]) {
        const timeString = `${hour === 12 ? 12 : hour % 12}:${minutes === 0 ? '00' : '30'} ${hour >= 12 ? 'pm' : 'am'}`;
        
        // If it's today, only show future time slots
        if (isToday) {
          const slotTime = hour * 60 + minutes;
          const currentTime = currentHour * 60 + currentMinutes;
          if (slotTime <= currentTime) continue;
        }
        
        slots.push(timeString);
      }
    }
    
    return slots;
  };

  const handleBookingSubmit = () => {
    if (!selectedDate || !selectedTime || !selectedService || !user) return;

    const formattedDate = new Date(selectedDate);
    formattedDate.setMinutes(formattedDate.getMinutes() - formattedDate.getTimezoneOffset());
    
    const bookingHistory = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    const newBooking: BookingData = {
      date: formattedDate.toISOString().split('T')[0],
      time: selectedTime,
      bookedAt: new Date().toISOString(),
      serviceName: selectedService.title,
      userId: user.id,
      userEmail: user.primaryEmailAddress?.emailAddress || '',
      userName: `${user.firstName} ${user.lastName}` || user.username || ''
    };

    bookingHistory.push(newBooking);
    localStorage.setItem('bookingHistory', JSON.stringify(bookingHistory));

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setIsModalOpen(false);
      setSelectedDate(null);
      setSelectedTime("");
    }, 2000);
  };

  useEffect(() => {
    setSelectedTime("");
  }, [selectedDate]);

  useEffect(() => {
    const savedCategories = localStorage.getItem("serviceCategories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }

    const savedServices = localStorage.getItem("services");
    if (savedServices) {
      setServices(JSON.parse(savedServices));
    }
  }, []);

  const filteredServices = selectedCategory
    ? services.filter(service => service.categoryId === selectedCategory)
    : services;

  const availableTimeSlots = getTimeSlots(selectedDate);

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-x-hidden p-10 pl-64">
      {/* Add user profile section */}
      <div className="fixed top-4 right-4 flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-600">{user?.primaryEmailAddress?.emailAddress}</span>
          <span className="font-medium">{user?.firstName || user?.username}</span>
        </div>
        <UserButton afterSignOutUrl="/"/>
      </div>

      <div className="pl-[70px] w-full">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex gap-6">
            {/* Categories Section */}
            <div className="w-1/4 max-w-xs">
              <h2 className="text-lg font-medium text-gray-700 mb-4">Service Categories</h2>
              {categories.length === 0 ? (
                <div className="text-center py-4 bg-gray-100 rounded-lg">
                  <p className="text-gray-600 italic">No service categories found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    onClick={() => setSelectedCategory(null)}
                    className={`p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                      selectedCategory === null ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <span className="text-gray-700">All Services</span>
                  </div>
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                        selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <span className="text-gray-700">{category.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Services Section */}
            <div className="flex-1">
              <h2 className="text-lg font-medium text-gray-700 mb-4">Services</h2>
              {filteredServices.length === 0 ? (
                <div className="text-center py-4 bg-gray-100 rounded-lg">
                  <p className="text-gray-600 italic">
                    {selectedCategory ? "No services in this category" : "No services added yet"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-3 border border-gray-200 cursor-pointer"
                      onClick={() => {
                        setSelectedService(service);
                        setIsModalOpen(true);
                      }}
                    >
                      {service.imageUrl && (
                        <img
                          src={service.imageUrl}
                          alt={service.title}
                          className="w-full h-28 object-cover rounded-md"
                        />
                      )}
                      <div className="mt-2">
                        <h3 className="text-sm font-semibold text-gray-800">{service.title}</h3>
                        <p className="text-xs text-gray-600">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            {bookingSuccess && (
              <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 z-50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                <span>Booking confirmed successfully!</span>
              </div>
            )}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-32 h-32 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {selectedService?.imageUrl && (
                    <img
                      src={selectedService.imageUrl}
                      alt={selectedService.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-semibold">{selectedService?.title}</h2>
                  <p className="text-gray-600 mb-2">{selectedService?.description}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Select Date</h3>
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {getDates().map((date) => (
                  <button
                    key={date.date.toISOString()}
                    onClick={() => setSelectedDate(date.date)}
                    className={`flex flex-col items-center min-w-[80px] p-3 rounded-2xl transition-colors ${
                      selectedDate?.toDateString() === date.date.toDateString()
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm">{date.dayName}</span>
                    <span className="text-xl font-semibold">{date.dayNumber}</span>
                  </button>
                ))}
              </div>

              <h3 className="text-lg font-semibold mb-4">Select Time</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {availableTimeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 rounded-full text-center transition-colors ${
                      selectedTime === time
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBookingSubmit}
                disabled={!selectedDate || !selectedTime}
                className={`px-6 py-2 rounded-lg text-white ${
                  (!selectedDate || !selectedTime)
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceList;