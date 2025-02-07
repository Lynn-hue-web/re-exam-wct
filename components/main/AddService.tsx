import React, { useState, useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface Service {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  categoryId: number; // Changed to number to match your ServiceCategory interface
}

interface ServiceCategory {
  id: number;
  name: string;
}

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  id: number;
  onClose: (id: number) => void;
}

// Notification component remains the same
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

  return (
    <div 
      className={`fixed top-4 right-4 z-50 ${bgColors[type]} text-white px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 ease-in-out animate-bounce`}
    >
      <div className="flex items-center space-x-3">
        <FaCheckCircle className="text-2xl" />
        <span className="text-md font-semibold">{message}</span>
      </div>
    </div>
  );
};

const AddService = () => {
  // Load categories from the same localStorage key used in ServiceCategory component
  const [categories, setCategories] = useState<ServiceCategory[]>(() => {
    const savedCategories = localStorage.getItem('serviceCategories');
    return savedCategories ? JSON.parse(savedCategories) : [];
  });

  const [services, setServices] = useState<Service[]>(() => {
    const savedServices = localStorage.getItem('services');
    return savedServices ? JSON.parse(savedServices) : [];
  });

  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '' // Will be converted to number when saving
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Refresh categories whenever they change in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCategories = localStorage.getItem('serviceCategories');
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', categoryId: '' });
    setPreviewUrl(null);
    setEditing(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      addNotification('Please select a category', 'error');
      return;
    }

    try {
      if (editing) {
        const updatedServices = services.map(service => 
          service.id === editing.id ? {
            ...service,
            title: formData.title,
            description: formData.description,
            categoryId: Number(formData.categoryId),
            imageUrl: previewUrl || service.imageUrl,
          } : service
        );
        setServices(updatedServices);
        localStorage.setItem('services', JSON.stringify(updatedServices));
        addNotification(`Service "${formData.title}" updated successfully!`, 'success');
      } else {
        const newService: Service = {
          id: Date.now().toString(),
          title: formData.title,
          description: formData.description,
          categoryId: Number(formData.categoryId),
          imageUrl: previewUrl || '',
        };
        const updatedServices = [...services, newService];
        setServices(updatedServices);
        localStorage.setItem('services', JSON.stringify(updatedServices));
        addNotification(`Service "${formData.title}" added successfully!`, 'success');
      }
    } catch (error) {
      console.error("Service operation failed:", error);
      addNotification('Operation failed. Please try again.', 'error');
    }

    resetForm();
  };

  const handleEdit = (service: Service) => {
    setFormData({
      title: service.title,
      description: service.description,
      categoryId: service.categoryId.toString(),
    });
    setPreviewUrl(service.imageUrl);
    setEditing(service);
  };

  const handleDelete = (serviceId: string) => {
    const deletedService = services.find(service => service.id === serviceId);
    const updatedServices = services.filter(service => service.id !== serviceId);
    setServices(updatedServices);
    localStorage.setItem('services', JSON.stringify(updatedServices));
    addNotification(`Service "${deletedService?.title}" deleted!`, 'warning');
  };

  return (
    <div className="w-[calc(100%-280px)] ml-auto p-6 relative">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification 
            key={notification.id}
            {...notification}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Add Service</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">
                {editing ? 'Edit Service' : 'Add New Service'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {previewUrl && (
                    <div className="mt-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {editing ? 'Update Service' : 'Add Service'}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Services Grid */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {service.imageUrl && (
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800">{service.title}</h3>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                      {getCategoryName(service.categoryId)}
                    </span>
                    <p className="text-gray-600 mt-2 text-sm">{service.description}</p>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEdit(service)}
                        className="flex-1 bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="flex-1 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddService;