"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/button/Button";
import { LockIcon, TrashBinIcon, PencilIcon } from "@/icons";
import Link from "next/link";
import { Car } from "@/types/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmationModal } from "@/components/mine/ConfirmationModal";
import Badge from "@/components/ui/badge/Badge";
import { collection, onSnapshot, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AddCarModal from "./AddCarModal";

export default function CarTable() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiLoader, setApiLoader] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<{ id: string; action: "delete" | "edit" } | null>(null);
  const [carToEdit, setCarToEdit] = useState<Car | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false); // Track client-side rendering

  useEffect(() => {
    setIsClient(true); // Set isClient to true after mounting
  }, []);

  // Real-time listener for Firestore collection
  useEffect(() => {
    if (!isClient) return; // Exit if not on the client

    const unsubscribe = onSnapshot(collection(db, "cars"), (snapshot) => {
      const carsData: Car[] = [];
      snapshot.forEach((doc) => {
        carsData.push({ id: doc.id, ...doc.data() } as Car);
      });
      setCars(carsData);
      setLoading(false);
    }, (err) => {
      setError("Error fetching cars");
      console.error(err);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [isClient]);

  // Delete a car
  const handleDeleteCar = async (id: string) => {
    setApiLoader(true);
    try {
      await deleteDoc(doc(db, "cars", id));
      toast.success("Car deleted successfully");
    } catch (err) {
      toast.error("Error deleting car");
      console.error(err);
    } finally {
      setApiLoader(false);
    }
  };

  // Add a new car
  const handleAddCar = async (car: Omit<Car, "id">) => {
    try {
      await addDoc(collection(db, "cars"), car);
      toast.success("Car added successfully");
    } catch (err) {
      toast.error("Error adding car");
      console.error(err);
    }
  };

  // Update a car
  const handleUpdateCar = async (id: string, updatedCar: Partial<Car>) => {
    try {
      await updateDoc(doc(db, "cars", id), updatedCar);
      toast.success("Car updated successfully");
    } catch (err) {
      toast.error("Error updating car");
      console.error(err);
    }
  };

  // Open modal for delete or edit
  const openModal = (id: string, action: "delete" | "edit") => {
    setSelectedCar({ id, action });
    if (action === "edit") {
      const car = cars.find((car) => car.id === id);
      if (car) {
        setCarToEdit(car);
        setIsAddModalOpen(true); // Open AddCarModal in edit mode
      }
    } else {
      setIsModalOpen(true);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedCar(null);
    setCarToEdit(null);
  };

  // Handle car added
  const handleCarAdded = () => {
    // Refresh the car list (optional: you can use a state update or Firestore listener)
  };

  // Confirm action (delete or edit)
  const confirmAction = () => {
    if (selectedCar) {
      if (selectedCar.action === "delete") {
        handleDeleteCar(selectedCar.id);
      }
    }
    closeModal();
  };

  // Filter cars based on search term
  const filteredCars = cars.filter(
    (car) =>
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isClient) return <p>Loading...</p>; // Render a fallback on the server
  if (loading) return <p className="px-5 py-3 text-white text-start text-theme-xs dark:text-gray-400">Loading cars...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-end p-4">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add New Car
        </button>
      </div>

      {/* Add/Edit Car Modal */}
      <AddCarModal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        onCarAdded={handleCarAdded}
        carToEdit={carToEdit} // Pass carToEdit for editing
      />

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100 dark:border-white/[0.05]">
        <input
          type="text"
          placeholder="Search by name or brand..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">Photo</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">Brand</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">From (AED)</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">Passengers</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">Auto</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">AC</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredCars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="w-10 h-10 overflow-hidden rounded-full">
                      {car.photoURL ? (
                        <Image width={40} height={40} src={car.photoURL} alt={car.name} />
                      ) : (
                        <div className="w-10 h-10 flex justify-center items-center bg-white overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                          <p className="font-semibold">N/A</p>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{car.name}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{car.brand}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{car.from}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{car.passengers}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color={car.isAuto ? "success" : "error"}>
                      {car.isAuto ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color={car.hasAC ? "success" : "error"}>
                      {car.hasAC ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="">
                    <div className="flex gap-3">
                      {/* Edit Button */}
                      <Button
                        onClick={() => openModal(car.id, "edit")}
                        className={"bg-blue-500 hover:bg-blue-600"}
                        disabled={apiLoader}
                        size="sm"
                        variant="primary"
                        startIcon={<PencilIcon />}
                      >
                        Edit
                      </Button>
                      {/* Delete Button */}
                      <Button
                        onClick={() => openModal(car.id, "delete")}
                        className={"bg-error-500 hover:bg-error-600"}
                        disabled={apiLoader}
                        size="sm"
                        variant="primary"
                        startIcon={<TrashBinIcon />}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmAction}
        title="Delete Car"
        message="Are you sure you want to delete this car?"
      />
    </div>
  );
}