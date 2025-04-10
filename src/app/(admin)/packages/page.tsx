"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Loader from "@/components/mine/Loader";

interface PackageItem {
  available: boolean;
  description: string;
  title: string;
}

interface Package {
  id?: string; // Add ID for Firestore document reference
  name: string;
  onlineDiscount: number; // Only online discount
  rating: number;
  excessUpto: number;
  list: PackageItem[];
  price7Seater: number; // New field
  priceEconomy: number; // New field
  priceSmallSUV: number; // New field
  priceStandardSUV: number; // New field
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  onlineDiscount: Yup.number().required("Online Discount is required").min(0).max(100), // Ensure discount is between 0 and 100
  rating: Yup.number().required("Rating is required").min(0),
  excessUpto: Yup.number().required("Excess Upto is required").min(0),
  price7Seater: Yup.number().required("Required").min(0), // Base price for 7 Seater
  priceEconomy: Yup.number().required("Required").min(0), // Base price for Economy
  priceSmallSUV: Yup.number().required("Required").min(0), // Base price for Small SUV
  priceStandardSUV: Yup.number().required("Required").min(0), // Base price for Standard SUV
  list: Yup.array()
    .of(
      Yup.object().shape({
        title: Yup.string().required("Title is required"),
        description: Yup.string().required("Description is required"),
        available: Yup.boolean().required("Availability is required"),
      })
    )
    .required("At least one list item is required"),
});

const PackagesTable = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [apiLoader, setApiLoader] = useState(false);

  // Fetch data from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "packages"), (querySnapshot) => {
      const packagesData: Package[] = [];
      querySnapshot.forEach((doc) => {
        packagesData.push({
          id: doc.id, // Include the document ID
          ...doc.data(),
        } as Package);
      });
      setPackages(packagesData);
      setLoading(false);
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  // Handle Add/Edit Package
  const handleSubmit = async (values: Package) => {
    setApiLoader(true); // Show loader
    try {
      if (editingPackage) {
        // Update existing package
        const packageRef = doc(db, "packages", editingPackage.id!);
        await updateDoc(packageRef, values as any);
      } else {
        // Add new package
        await addDoc(collection(db, "packages"), values);
      }
      setIsModalOpen(false);
      setEditingPackage(null);
    } catch (error) {
      console.error("Error updating/adding package:", error);
    } finally {
      setApiLoader(false); // Hide loader
    }
  };

  // Handle Delete Package
  const handleDelete = async (id: string) => {
    setApiLoader(true); // Show loader
    try {
      await deleteDoc(doc(db, "packages", id));
    } catch (error) {
      console.error("Error deleting package:", error);
    } finally {
      setApiLoader(false); // Hide loader
    }
  };

  // Open modal for adding/editing
  const openModal = (pkg: Package | null = null) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-900 text-white rounded-lg p-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          Add New Package
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Online Discount</th>
              <th className="p-2 border">7 Seater Price</th>
              <th className="p-2 border">Economy Price</th>
              <th className="p-2 border">SUVs Price</th>
              <th className="p-2 border">Mid-Size Sedan Price</th>
              <th className="p-2 border">Rating</th>
              <th className="p-2 border">Excess Upto</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages?.map((pkg) => (
              <tr key={pkg.id} className="bg-gray-700 hover:bg-gray-600">
                <td className="p-2 border">{pkg.name}</td>
                <td className="p-2 border">{pkg.onlineDiscount}%</td>
                <td className="p-2 border">${(pkg.price7Seater * (100 - pkg.onlineDiscount) / 100).toFixed(2)}</td>
                <td className="p-2 border">${(pkg.priceEconomy * (100 - pkg.onlineDiscount) / 100).toFixed(2)}</td>
                <td className="p-2 border">${(pkg.priceSmallSUV * (100 - pkg.onlineDiscount) / 100).toFixed(2)}</td>
                <td className="p-2 border">${(pkg.priceStandardSUV * (100 - pkg.onlineDiscount) / 100).toFixed(2)}</td>
                <td className="p-2 border">{pkg.rating}</td>
                <td className="p-2 border">{pkg.excessUpto}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => openModal(pkg)}
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded mr-2"
                    disabled={apiLoader}
                  >
                    {apiLoader ? "Loading..." : "Edit"}
                  </button>
                  {/* <button
                    onClick={() => handleDelete(pkg.id!)}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                    disabled={apiLoader}
                  >
                    {apiLoader ? "Loading..." : "Delete"}
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center overflow-auto justify-center p-4 z-99999">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full h-[100vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingPackage ? "Edit Package" : "Add New Package"}
            </h2>
            <Formik
              initialValues={{
                name: editingPackage?.name || "",
                onlineDiscount: editingPackage?.onlineDiscount || 0,
                rating: editingPackage?.rating || 0,
                excessUpto: editingPackage?.excessUpto || 0,
                price7Seater: editingPackage?.price7Seater || 0,
                priceEconomy: editingPackage?.priceEconomy || 0,
                priceSmallSUV: editingPackage?.priceSmallSUV || 0,
                priceStandardSUV: editingPackage?.priceStandardSUV || 0,
                list: editingPackage?.list || [],
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue }) => {
                // Function to calculate discounted prices
                const calculateDiscountedPrices = (discount: number) => {
                  const discountMultiplier = (100 - discount) / 100;
                  setFieldValue("price7Seater", (values.price7Seater * discountMultiplier).toFixed(2));
                  setFieldValue("priceEconomy", (values.priceEconomy * discountMultiplier).toFixed(2));
                  setFieldValue("priceSmallSUV", (values.priceSmallSUV * discountMultiplier).toFixed(2));
                  setFieldValue("priceStandardSUV", (values.priceStandardSUV * discountMultiplier).toFixed(2));
                };

                return (
                  <Form className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block">Name</label>
                      <Field
                        type="text"
                        name="name"
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                      />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                    </div>

                    {/* Online Discount */}
                    <div>
                      <label className="block">Online Discount (%)</label>
                      <Field
                        type="number"
                        name="onlineDiscount"
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const discount = parseFloat(e.target.value);
                          setFieldValue("onlineDiscount", discount);
                          calculateDiscountedPrices(discount); // Recalculate prices when discount changes
                        }}
                      />
                      <ErrorMessage name="onlineDiscount" component="div" className="text-red-500 text-sm" />
                    </div>

                    {/* Base Prices */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block">7 Seater Base Price</label>
                        <Field
                          type="number"
                          name="price7Seater"
                          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                        />
                        <ErrorMessage name="price7Seater" component="div" className="text-red-500 text-sm" />
                      </div>
                      <div>
                        <label className="block">Economy Base Price</label>
                        <Field
                          type="number"
                          name="priceEconomy"
                          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                        />
                        <ErrorMessage name="priceEconomy" component="div" className="text-red-500 text-sm" />
                      </div>
                      <div>
                        <label className="block">SUVs Base Price</label>
                        <Field
                          type="number"
                          name="priceSmallSUV"
                          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                        />
                        <ErrorMessage name="priceSmallSUV" component="div" className="text-red-500 text-sm" />
                      </div>
                      <div>
                        <label className="block">Mid-Size Sedan Base Price</label>
                        <Field
                          type="number"
                          name="priceStandardSUV"
                          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                        />
                        <ErrorMessage name="priceStandardSUV" component="div" className="text-red-500 text-sm" />
                      </div>
                    </div>

                    {/* Display Discounted Prices */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block">7 Seater Discounted Price</label>
                        <div className="w-full p-2 rounded bg-gray-800 border border-gray-700">
                          ${(values.price7Seater * (100 - values.onlineDiscount) / 100).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <label className="block">Economy Discounted Price</label>
                        <div className="w-full p-2 rounded bg-gray-800 border border-gray-700">
                          ${(values.priceEconomy * (100 - values.onlineDiscount) / 100).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <label className="block">SUVs Discounted Price</label>
                        <div className="w-full p-2 rounded bg-gray-800 border border-gray-700">
                          ${(values.priceSmallSUV * (100 - values.onlineDiscount) / 100).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <label className="block">Mid-Size Sedan Discounted Price</label>
                        <div className="w-full p-2 rounded bg-gray-800 border border-gray-700">
                          ${(values.priceStandardSUV * (100 - values.onlineDiscount) / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Rating and Excess Upto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block">Rating</label>
                        <Field
                          type="number"
                          name="rating"
                          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                        />
                        <ErrorMessage name="rating" component="div" className="text-red-500 text-sm" />
                      </div>
                      <div>
                        <label className="block">Excess Upto</label>
                        <Field
                          type="number"
                          name="excessUpto"
                          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                        />
                        <ErrorMessage name="excessUpto" component="div" className="text-red-500 text-sm" />
                      </div>
                    </div>

                    {/* List Items */}
                    <div>
                      <label className="block">List</label>
                      {values.list.map((item, index) => (
                        <div key={index} className="mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block">Title</label>
                              <Field
                                type="text"
                                name={`list[${index}].title`}
                                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                              />
                              <ErrorMessage
                                name={`list[${index}].title`}
                                component="div"
                                className="text-red-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block">Description</label>
                              <Field
                                type="text"
                                name={`list[${index}].description`}
                                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                              />
                              <ErrorMessage
                                name={`list[${index}].description`}
                                component="div"
                                className="text-red-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block">Available</label>
                              <Field
                                type="checkbox"
                                name={`list[${index}].available`}
                                className="mt-2"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newList = values.list.filter((_, i) => i !== index);
                              setFieldValue("list", newList);
                            }}
                            className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded mt-2"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFieldValue("list", [...values.list, { title: "", description: "", available: false }])}
                        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
                      >
                        Add Item
                      </button>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="bg-gray-500 px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="bg-green-500 px-4 py-2 rounded" disabled={apiLoader}>
                        {apiLoader ? "Loading..." : editingPackage ? "Update" : "Add"}
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesTable;