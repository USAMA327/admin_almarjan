import { db } from "@/lib/firebase";
import { Car } from "@/types/types";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCarAdded: () => void;
  carToEdit?: Car | null; // Optional prop for editing
}

const AddCarModal: React.FC<AddCarModalProps> = ({ isOpen, onClose, onCarAdded, carToEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    photoURL: "",
    from: 0,
    passengers: 0,
    isAuto: false,
    hasAC: false,
  });
  const [loading, setLoading] = useState(false);

  // Populate form data if carToEdit is provided
  useEffect(() => {
    if (carToEdit) {
      setFormData({
        name: carToEdit.name,
        brand: carToEdit.brand,
        photoURL: carToEdit.photoURL,
        from: carToEdit.from,
        passengers: carToEdit.passengers,
        isAuto: carToEdit.isAuto,
        hasAC: carToEdit.hasAC,
      });
    } else {
      // Reset form if no carToEdit
      setFormData({
        name: "",
        brand: "",
        photoURL: "",
        from: 0,
        passengers: 0,
        isAuto: false,
        hasAC: false,
      });
    }
  }, [carToEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (carToEdit) {
        // Update existing car
        await updateDoc(doc(db, "cars", carToEdit.id), formData);
        toast.success("Car updated successfully!");
      } else {
        // Add new car
        await addDoc(collection(db, "cars"), formData);
        toast.success("Car added successfully!");
      }
      onCarAdded(); // Refresh the car list
      onClose(); // Close the modal
    } catch (error) {
      toast.error(carToEdit ? "Error updating car" : "Error adding car");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{carToEdit ? "Edit Car" : "Add New Car"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Car Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="brand"
              placeholder="Brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="photoURL"
              placeholder="Photo URL"
              value={formData.photoURL}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              name="from"
              placeholder="Price (AED)"
              value={formData.from}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              name="passengers"
              placeholder="Passengers"
              value={formData.passengers}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isAuto"
                checked={formData.isAuto}
                onChange={handleInputChange}
                className="form-checkbox"
              />
              <span>Automatic</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="hasAC"
                checked={formData.hasAC}
                onChange={handleInputChange}
                className="form-checkbox"
              />
              <span>Air Conditioning</span>
            </label>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? (carToEdit ? "Updating..." : "Adding...") : carToEdit ? "Update Car" : "Add Car"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCarModal;