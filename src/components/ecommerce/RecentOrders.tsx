"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs, getDoc, doc, query, orderBy, limit, DocumentReference } from "firebase/firestore";
import { db } from "@/lib/firebase";
import moment from "moment";
import Link from "next/link";

export interface Booking {
  id: string;
  user: {
    email: string;
    phone: string;
  };
  createdAt: string;
  pickupDate: Date;
  location: string;
  pickupTime: Date;
  totalPrice: number;
  status: number; // 1: Confirmed, 2: Active, 3: Completed, 4: Cancelled
  car: any
}

export default function RecentOrders() {


  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        // Fetch top 5 recent bookings ordered by createdAt
        const bookingsQuery = query(
          collection(db, "bookings"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);

        const bookingsData: Booking[] = [];
        for (const docSnapshot of bookingsSnapshot.docs) {
          const bookingData = docSnapshot.data() as Booking;
          bookingData.id = docSnapshot.id;

          // Fetch car details if car is a reference
          let carData = bookingData.car;
          if (bookingData.car && typeof bookingData.car === "object" && "path" in bookingData.car) {
            const carDoc = await getDoc(bookingData.car);
            if (carDoc.exists()) {
              carData = carDoc.data() as { name: string; image: string };
            }
          }

          // Fetch user details if user is a reference
          let userData = bookingData.user;
          if (bookingData.user && typeof bookingData.user === "object" && !("email" in bookingData.user)) {
            const userDoc = await getDoc(bookingData.user as DocumentReference);
            if (userDoc.exists()) {
              userData = userDoc.data() as { email: string; phone: string };
            }
          }

          // Add the booking to the list
          bookingsData.push({
            ...bookingData,
            car: carData,
            user: userData,
            createdAt: new Date(bookingData.createdAt).toISOString(),
          });
        }

        setBookings(bookingsData);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBookings();
  }, []);

  // Skeleton loader
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recent Orders
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <Link href={"/bookings"}>
            <button  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              See all
            </button>
            </Link>

          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Details
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Pickup Location
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Pickup Date & Time
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Price
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[50px] w-[50px] bg-gray-300 rounded-md animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-gray-300 rounded animate-pulse" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-6 w-16 bg-gray-300 rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recent Orders
            </h3>
          </div>
        </div>
        <div className="text-center text-red-500 py-10">Failed to load data.</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Bookings
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <Link href={"/bookings"}>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button>
          </Link>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Details
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Pickup Location
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Pickup Date & Time
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Price
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <Image
                        width={50}
                        height={50}
                        src={booking.car.image}
                        className="h-[50px] w-[50px] object-contain"
                        alt={booking.car.name}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {booking.car.name}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {booking.user?.email} | {booking.user?.phone}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {booking.location}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {moment(booking.pickupDate).format("ddd, DD, MM, YYYY")} |{" "}
                  {moment(booking.pickupTime).format("hh:mm A")}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  AED {booking.totalPrice.toFixed(2)}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      booking.status === 1
                        ? "info"
                        : booking.status === 2
                        ? "warning"
                        : booking.status === 3
                        ? "success"
                        : "error"
                    }
                  >
                    {booking.status === 1
                      ? "Confirmed"
                      : booking.status === 2
                      ? "Active"
                      : booking.status === 3
                      ? "Completed"
                      : "Cancelled"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}