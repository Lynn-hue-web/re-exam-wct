import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaLayerGroup, FaCheckCircle } from "react-icons/fa";

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

const ServiceCategory = () => {
  // Load categories from localStorage on initial render
  const [categories, setCategories] = useState<ServiceCategory[]>(() => {
    const savedCategories = localStorage.getItem('serviceCategories');
    return savedCategories ? JSON.parse(savedCategories) : [];
  });

  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [editedName, setEditedName] = useState("");
  
  // Changed notifications to an array to support multiple notifications
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  // Update localStorage whenever categories change
  useEffect(() => {
    localStorage.setItem('serviceCategories', JSON.stringify(categories));
  }, [categories]);

  // Add notification with unique ID
  const addNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    const newNotification: NotificationProps = {
      id: Date.now(), // unique identifier
      message,
      type,
      onClose: removeNotification
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  // Remove a specific notification
  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Add Category
  const handleAddCategory = () => {
    if (newCategory.trim() === "") return;

    const newEntry = { id: Date.now(), name: newCategory };
    setCategories([...categories, newEntry]);
    
    // Show success notification
    addNotification(`Category "${newCategory}" added successfully!`, 'success');
    
    setNewCategory("");
  };

  // Delete Category
  const handleDeleteCategory = (id: number) => {
    const deletedCategory = categories.find(category => category.id === id);
    setCategories(categories.filter((category) => category.id !== id));
    
    // Show notification for deletion
    addNotification(`Category "${deletedCategory?.name}" deleted!`, 'warning');
  };

  // Edit Category
  const handleEditCategory = (category: ServiceCategory) => {
    setEditingCategory(category);
    setEditedName(category.name);
  };

  // Update Category
  const handleUpdateCategory = () => {
    if (!editingCategory || editedName.trim() === "") return;

    setCategories(
      categories.map((category) =>
        category.id === editingCategory.id ? { ...category, name: editedName } : category
      )
    );

    // Show notification for update
    addNotification(`Category updated to "${editedName}"!`, 'success');

    setEditingCategory(null);
    setEditedName("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 relative">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification 
            key={notification.id}
            {...notification}
          />
        ))}
      </div>

      {/* Rest of the component remains the same */}
      <div className="p-8">
        <div className="flex items-center mb-6">
          <FaLayerGroup className="mr-4 text-4xl text-blue-600" />
          <h2 className="text-3xl font-bold">Service Categorie</h2>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            placeholder="Enter category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            onClick={handleAddCategory}
            className="w-full flex items-center justify-center gap-3 border p-4 rounded-xl hover:bg-gray-100 transition duration-300"
          >
            <FaPlus className="text-xl" />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories List Section - remains the same as previous implementation */}
      <div>
        <div className="p-8 overflow-y-auto max-h-[600px]">
          <h3 className="text-2xl font-semibold mb-6">
            Categories ({categories.length})
          </h3>

          {categories.length > 0 ? (
            <ul className="space-y-4">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="border rounded-xl p-4 flex justify-between items-center hover:bg-gray-50 transition duration-300"
                >
                  {editingCategory?.id === category.id ? (
                    <div className="flex w-full gap-3">
                      <input
                        type="text"
                        className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                      />
                      <button
                        onClick={handleUpdateCategory}
                        className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-lg font-medium">{category.name}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="border p-2 rounded-lg hover:bg-gray-100 transition duration-300"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="border p-2 rounded-lg hover:bg-gray-100 transition duration-300"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center italic py-8">
              No categories added yet. Start creating!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCategory;