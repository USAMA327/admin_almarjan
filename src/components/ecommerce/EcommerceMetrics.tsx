"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const EcommerceMetrics = () => {
  const [customersCount, setCustomersCount] = useState<number | string>("N/A");
  const [ordersCount, setOrdersCount] = useState<number | string>("N/A");
  const [completedBookingsCount, setCompletedBookingsCount] = useState<number | string>("N/A");
  const [activeBookingsCount, setActiveBookingsCount] = useState<number | string>("N/A");
  const [cancelledBookingsCount, setCancelledBookingsCount] = useState<number | string>("N/A");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers (users) data
        const usersSnapshot = await getDocs(collection(db, "users"));
        setCustomersCount(usersSnapshot.size);

        // Fetch orders (bookings) data
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));
        setOrdersCount(bookingsSnapshot.size);

        // Filter completed bookings (status === 3)
        const completedBookings = bookingsSnapshot.docs.filter(
          (doc) => doc.data().status === 3
        );
        setCompletedBookingsCount(completedBookings.length);

        // Filter active bookings (status === 2)
        const activeBookings = bookingsSnapshot.docs.filter(
          (doc) => doc.data().status === 2
        );
        setActiveBookingsCount(activeBookings.length);

        // Filter cancelled bookings (status === 4)
        const cancelledBookings = bookingsSnapshot.docs.filter(
          (doc) => doc.data().status === 4
        );
        setCancelledBookingsCount(cancelledBookings.length);
      } catch (err) {
        console.error("Error fetching data:", err);
        setCustomersCount("N/A");
        setOrdersCount("N/A");
        setCompletedBookingsCount("N/A");
        setActiveBookingsCount("N/A");
        setCancelledBookingsCount("N/A");
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Skeleton loader
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {/* Skeleton for Customers */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse dark:bg-gray-700" />
          </div>
          <div className="mt-5">
            <div className="w-24 h-4 bg-gray-300 rounded animate-pulse dark:bg-gray-700" />
            <div className="w-16 h-6 mt-2 bg-gray-300 rounded animate-pulse dark:bg-gray-700" />
          </div>
        </div>

        {/* Skeleton for Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse dark:bg-gray-700" />
          </div>
          <div className="mt-5">
            <div className="w-24 h-4 bg-gray-300 rounded animate-pulse dark:bg-gray-700" />
            <div className="w-16 h-6 mt-2 bg-gray-300 rounded animate-pulse dark:bg-gray-700" />
          </div>
        </div>

        {/* Skeleton for Completed Bookings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse dark:bg-gray-700" />
          </div>
          <div className="mt-5">
            <div className="w-24 h-4 bg-gray-300 rounded animate-pulse dark:bg-gray-700" />
            <div className="w-16 h-6 mt-2 bg-gray-300 rounded animate-pulse dark:bg-gray-700" />
          </div>
        </div>

        {/* Skeleton for Active Bookings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse dark:bg-gray-700" />
          </div>
          <div className="mt-5">
            <div className="w-24 h-4 bg-gray-300 rounded animate-pulse dark:bg-gray-700" />
            <div className="w-16 h-6 mt-2 bg-gray-300 rounded animate-pulse dark:bg-gray-700" />
          </div>
        </div>

        {/* Skeleton for Cancelled Bookings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse dark:bg-gray-700" />
          </div>
          <div className="mt-5">
            <div className="w-24 h-4 bg-gray-300 rounded animate-pulse dark:bg-gray-700" />
            <div className="w-16 h-6 mt-2 bg-gray-300 rounded animate-pulse dark:bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* Customers Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {customersCount}
            </h4>
          </div>
        </div>
      </div>

      {/* Orders Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Bookings
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {ordersCount}
            </h4>
          </div>
        </div>
      </div>

      {/* Completed Bookings Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Completed Bookings
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {completedBookingsCount}
            </h4>
          </div>
        </div>
      </div>

      {/* Active Bookings Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Active Bookings
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {activeBookingsCount}
            </h4>
          </div>
        </div>
      </div>

      {/* Cancelled Bookings Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Cancelled Bookings
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {cancelledBookingsCount}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};