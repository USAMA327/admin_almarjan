"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Loader from "@/components/mine/Loader";

const DiscountUpdater = () => {
  const [apiloading, setApiLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState<number | null>(null);

  const discountDocId = "QZef7kBLZHRZGu2kUYt9"; // Firestore document ID

  // Fetch current discount from Firestore
  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const docRef = doc(db, "discount", discountDocId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCurrentDiscount(docSnap.data().discount);
        } else {
          console.error("No discount document found.");
        }
      } catch (error) {
        toast.error("Error while fetching discount!");
      } finally {
        setApiLoading(false);
      }
    };

    fetchDiscount();
  }, []);

  // Yup validation schema (values between 1-100)
  const validationSchema = Yup.object().shape({
    discount: Yup.number()
      .min(1, "Discount must be at least 1%")
      .max(100, "Discount cannot exceed 100%")
      .required("Discount is required"),
  });

  // Update discount in Firestore
  const updateDiscount = async (values: { discount: number }) => {
    setLoading(true);
    try {
      const discountRef = doc(db, "discount", discountDocId);
      const discountValue = values.discount / 100; // Convert to decimal (10 -> 0.1)
      await updateDoc(discountRef, { discount: discountValue });

      setCurrentDiscount(discountValue);
      toast.success("Discount updated successfully!");
    } catch (error) {
      console.error("Error updating discount:", error);
      toast.error("Failed to update discount.");
    }
    setLoading(false);
  };

  return apiloading ? (
   <Loader/>
  ) : (
    <div className="">
      <Formik
        initialValues={{ discount: currentDiscount ? currentDiscount * 100 : 10 }}
        validationSchema={validationSchema}
        onSubmit={updateDiscount}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
           
              <Field
                type="number"
                name="discount"
                className="mt-1 block w-36 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="100"
              />
              <ErrorMessage name="discount" component="p" className="text-red-500 text-sm mt-1" />
            </div>

            <button
              type="submit"
              className="w-36 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? "Updating..." : "Update Discount"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DiscountUpdater;
