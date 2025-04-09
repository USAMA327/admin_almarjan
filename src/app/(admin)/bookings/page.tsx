'use client'
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import Loader from "@/components/mine/Loader";
import moment from "moment";
import { ConfirmationModal } from "@/components/mine/ConfirmationModal";
import Summary from "@/components/mine/BookingSummary";

interface Booking {
  id: string;
  car: any; // Firestore DocumentReference or Car object
  createdAt: string;
  dropoffDate: Date;
  dropoffLocation: string;
  pickupDate: Date;
  location: string;
  dropoffTime: Date;
  pickupTime: Date;
  selectedAddOns: AddOn[];
  totalPrice: number;
  user: any; // Firestore DocumentReference or User object
  status: number; // 1: Confirmed, 2: Active, 3: Completed, 4: Cancelled
  selectedPackage: Package;
  isPaid: boolean; // Payment status
  numberOfDays:number
}

interface AddOn {
  id?: string;
  name: string;
  price: number;
  perDay?: boolean;
}

interface Package {
  id?: string;
  name: string;
  onlineDiscount: number;
  rating: number;
  excessUpto: number;
  newPrice: number;
  oldPrice: number;
  list: {
    available: boolean;
    title: string;
    description: string;
  }[];
}

interface Car {
  id: string;
  number: string;
  brand: "Nissan" | "Toyota" | "MG" | "Hyundai" | "Kia" | "Mitsubishi" | "Renault";
  name: string;
  category: "Economy" | "Mid size Sedan" | "Crossover" | "SUVs";
  passengers: number;
  isAuto: boolean;
  airConditioner: boolean;
  doors: number;
  price: number;
  image: string;
  isTop: boolean;
  bags: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiLoader, setApiLoader] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for confirmation modal
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null); // Track the booking to delete
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);

  // Fetch bookings and cars
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch bookings
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));
        const bookingsData = await Promise.all(
          bookingsSnapshot.docs.map(async (doc) => {
            const bookingData = doc.data();

            // Fetch car details
            const carSnapshot = await getDoc(bookingData.car);
            const carData = carSnapshot.data();
            let userData =null
            // Fetch user details
            if (bookingData.user && bookingData.user.email) {
              return {
                id: doc.id,
                ...bookingData,
                car: carData, // Replace reference with car data
                user: bookingData.user, // Replace reference with user data
                createdAt: new Date(bookingData.createdAt).toISOString(),
              };
            } else { 
              const userSnapshot = await getDoc(bookingData.user);
              return {
                id: doc.id,
                ...bookingData,
                car: carData, // Replace reference with car data
                user: userSnapshot.data(), // Replace reference with user data
                createdAt: new Date(bookingData.createdAt).toISOString(),
              };
            }



          
          })
        );

        // Sort bookings by createdAt in descending order
        const sortedBookings = bookingsData.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setBookings(sortedBookings as any);

        // Fetch cars (for the dropdown)
        const carsSnapshot = await getDocs(collection(db, "cars"));
        const carsData = carsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Car[];
        setCars(carsData);
      } catch (error) {
        toast.error("Error fetching data");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle status change
  const handleStatusChange = async (id: string, status: number) => {
    setApiLoader(true);
    try {
      const bookingRef = doc(db, "bookings", id.toString());
      await updateDoc(bookingRef, { status });
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status } : booking
        )
      );
      toast.success("Status updated successfully!");
    } catch (error) {
      toast.error("Error updating status");
      console.error("Error updating status:", error);
    } finally {
      setApiLoader(false);
    }
  };

  // Handle delete booking
  const handleDeleteBooking = async (id: string) => {
    setApiLoader(true);
    try {
      await deleteDoc(doc(db, "bookings", id.toString()));
      setBookings((prev) => prev.filter((booking) => booking.id !== id));
      toast.success("Booking deleted successfully!");
    } catch (error) {
      toast.error("Error deleting booking");
      console.error("Error deleting booking:", error);
    } finally {
      setApiLoader(false);
    }
  };

  // Handle car change
  const handleCarChange = async (id: string, carId: string) => {
    setApiLoader(true);
    try {
      const bookingRef = doc(db, "bookings", id.toString());
      const carRef = doc(db, "cars", carId);
      await updateDoc(bookingRef, { car: carRef });
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, car: carRef } : booking
        )
      );
      toast.success("Car updated successfully!");
    } catch (error) {
      toast.error("Error updating car");
      console.error("Error updating car:", error);
    } finally {
      setApiLoader(false);
    }
  };

  // Handle payment status change
  const handlePaymentStatusChange = async (id: string, status: boolean) => {
    setApiLoader(true);
    try {
      const bookingRef = doc(db, "bookings", id.toString());
      await updateDoc(bookingRef, { isPaid: status });
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, isPaid: status } : booking
        )
      );
      toast.success("Payment status updated successfully!");
    } catch (error) {
      toast.error("Error updating payment status");
      console.error("Error updating payment status:", error);
    } finally {
      setApiLoader(false);
    }
  };

  // Open confirmation modal for delete
  const openDeleteModal = (id: string) => {
    setSelectedBookingId(id);
    setIsModalOpen(true);
  };

  // Close confirmation modal
  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setSelectedBookingId(null);
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (selectedBookingId) {
      handleDeleteBooking(selectedBookingId);
    }
    closeDeleteModal();
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-lg p-4">
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 border">Booking ID</th>
              <th className="p-2 border">Car</th>
              <th className="p-2 border">Dates</th>
              <th className="p-2 border">Locations</th>
              <th className="p-2 border">Total Price</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="bg-gray-700 hover:bg-gray-600">
                <td className="p-2 border">{booking.id}</td>
                <td className="p-2 border">
                  <p className=" mb-2"><small className="">Selected</small> : {booking.car.name}</p>
                  <select
                    value={booking.car.id}
                    onChange={(e) => handleCarChange(booking.id, e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded p-1"
                  >
                    {cars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.name} ({car.number})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 border">{moment(booking.pickupDate).format("ddd, DD, MM, YYYY")} | {moment(booking.dropoffDate).format("ddd, DD, MM, YYYY")}</td>
                {booking.location === booking.dropoffLocation ? (
                  <td className="p-2 border">{booking.location} <span className="text-success-400">(Same)</span></td>
                ) : (
                  <td className="p-2 border">{booking.location} {booking.dropoffLocation ? "| " + booking.dropoffLocation : <span className="text-success-400">(Same)</span>}</td>
                )}
                <td className="p-2 border">AED {booking.totalPrice.toFixed(2)}</td>
                <td className="p-2 border">
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusChange(booking.id, parseInt(e.target.value))}
                    className="bg-gray-800 border border-gray-700 rounded p-1"
                  >
                    <option value={1}>Confirmed</option>
                    <option value={2}>Active</option>
                    <option value={3}>Completed</option>
                    <option value={4}>Cancelled</option>
                  </select>
                </td>
                <td className="p-2 border ">
                  <button
                    onClick={() => {
                      setSelectedBookingDetails(booking);
                      setIsDetailsModalOpen(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 px-3 mb-2 w-full py-1 rounded mr-2"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => openDeleteModal(booking.id)}
                    className="bg-red-500 w-full hover:bg-red-600 px-3 py-1 rounded"
                    disabled={apiLoader}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Details Modal */}
      <DetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        booking={selectedBookingDetails}
        onPaymentStatusChange={handlePaymentStatusChange}
      />
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Booking"
        message="Are you sure you want to delete this booking?"
      />
    </div>
  );
}

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onPaymentStatusChange: (id: string, status: boolean) => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ isOpen, onClose, booking, onPaymentStatusChange }) => {
  if (!booking) return null;

  return (
    <div className={`fixed inset-0 bg-black   bg-opacity-50 flex items-center  justify-center z-99999 ${isOpen ? '' : 'hidden'}`}>
      <div className=" p-6 rounded-lg w-full h-[100vh]  py-10  bg-black  overflow-scroll ">
        <div className="flex justify-end">

      <button
          onClick={onClose}
          className=" self-end bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
        >
          Close
        </button>
        </div>
        <div>
        <p className="px-6"><strong>Booking ID:</strong> {booking.id} ( {booking.status == 1
                        ? "Confirmed"
                        : booking.status == 2
              ? "Active"
              : booking.status == 3
                          ? "Completed"
                          : "Cancellation "})</p>
          
          <Summary
            user={booking.user}
            isPaid={booking.isPaid}
            car={booking.car}
            values={{
              location: booking.location,
              dropoffLocation: booking.dropoffLocation,
              dropoffDate: booking.dropoffDate,
              pickupDate: booking.pickupDate,
              pickupTime: booking.pickupTime,
              dropoffTime:booking.dropoffTime
              
            }}
            finalTotal={booking.totalPrice}
            numberOfDays={booking.numberOfDays}
            addons={booking.selectedAddOns}
            selectedPackage={booking.selectedPackage}
          />

          <div className="px-6">
               {/* Payment Status */}
               {booking.isPaid ? (
            <p><strong>Payment Status:</strong> Paid</p>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Payment Status</label>
              <select
                value={booking.isPaid ? "paid" : "unpaid"}
                onChange={(e) => onPaymentStatusChange(booking.id, e.target.value === "paid")}
                className="bg-gray-700 border border-gray-600 rounded p-2"
              >
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          )}
         </div>
       </div>
      
      </div>
    </div>
  );
};