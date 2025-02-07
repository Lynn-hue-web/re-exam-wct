"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

interface BookingData {
  date: string;
  time: string;
  bookedAt: string;
  serviceName: string;
  userId: string;
  userEmail: string;
  userName: string;
}

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  id: number;
  onClose: (id: number) => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, id, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  };

  const icons = {
    success: <FaCheckCircle className="text-2xl" />,
    error: <FaTimes className="text-2xl" />,
    warning: <FaExclamationTriangle className="text-2xl" />
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${bgColors[type]} text-white px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 ease-in-out animate-bounce`}
    >
      <div className="flex items-center space-x-3">
        {icons[type]}
        <span className="text-md font-semibold">{message}</span>
      </div>
    </div>
  );
};

const BookAppointment = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingData | null>(null);

  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<BookingData | null>(null);

  const addNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    const newNotification: NotificationProps = {
      id: Date.now(),
      message,
      type,
      onClose: removeNotification
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // New function to check if booking is new
  const isNewBooking = (booking: BookingData) => {
    const bookingDate = new Date(booking.bookedAt);
    const currentDate = new Date();
    const hoursDifference = (currentDate.getTime() - bookingDate.getTime()) / (1000 * 3600);
    return hoursDifference <= 24; // Consider a booking new if booked within the last 24 hours
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = () => {
    try {
      const bookingHistory = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
      const userBookings = user
        ? bookingHistory.filter((booking: BookingData) => booking.userId === user.id)
        : [];
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
      addNotification('Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    if (!editingBooking || !user) return;

    const allBookings = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    const updatedBookings = allBookings.map((booking: BookingData) => {
      if (booking.bookedAt === editingBooking.bookedAt && booking.userId === user.id) {
        return {
          ...editingBooking,
          userEmail: user.primaryEmailAddress?.emailAddress || '',
          userName: `${user.firstName} ${user.lastName}` || user.username || ''
        };
      }
      return booking;
    });

    localStorage.setItem('bookingHistory', JSON.stringify(updatedBookings));
    setIsEditing(false);
    setEditingBooking(null);
    fetchBookings();
    addNotification('Booking updated successfully!', 'success');
  };

  const handleDelete = (booking: BookingData) => {
    const allBookings = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    const updatedBookings = allBookings.filter((b: BookingData) =>
      !(b.userId === user?.id && b.bookedAt === booking.bookedAt)
    );
    localStorage.setItem('bookingHistory', JSON.stringify(updatedBookings));
    fetchBookings();
    setShowDeleteConfirm(false);
    setBookingToDelete(null);
    addNotification('Booking deleted successfully!', 'warning');
  };

  const confirmDelete = (booking: BookingData) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Confirm Delete</h2>
          <p className="mb-6">Are you sure you want to delete this booking?</p>
          <div className="flex gap-4">
            <button
              onClick={() => handleDelete(booking)}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const BookingForm = ({ data, setData, onSubmit, title }: any) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name
            </label>
            <input
              type="text"
              value={data.serviceName}
              onChange={(e) => setData({ ...data, serviceName: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => setData({ ...data, date: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={data.time}
              onChange={(e) => setData({ ...data, time: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={onSubmit}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {title === "New Booking" ? "Create" : "Update"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingBooking(null);
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-x-hidden p-10 pl-64">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
          />
        ))}
      </div>

      {/* User Profile Section */}
      <div className="fixed top-4 right-4 flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-600">{user?.primaryEmailAddress?.emailAddress}</span>
          <span className="font-medium">{user?.firstName || user?.username}</span>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="pl-[70px] w-full">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No appointments found. Create a new booking to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {booking.serviceName}
                          {isNewBooking(booking) && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(booking.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.userName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingBooking(booking);
                              setIsEditing(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setBookingToDelete(booking);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && editingBooking && (
        <BookingForm
          data={editingBooking}
          setData={setEditingBooking}
          onSubmit={handleUpdate}
          title="Edit Booking"
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && bookingToDelete && confirmDelete(bookingToDelete)}
    </div>
  );
};

export default BookAppointment;