"use client"
import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import Loader from "@/components/mine/Loader";

interface Addon {
  id?: string;
  name: string;
  description: string;
  perDay: boolean;
  price7Seater: number;
  priceEconomy: number;
  priceSmallSUV: number;
  priceStandardSUV: number;
  type: string;
}

const AddonsForm = () => {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiLoader, setApiLoader] = useState(false); // For Add/Edit/Delete operations

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),
    perDay: Yup.boolean().required("Required"),
    price7Seater: Yup.number().required("Required").min(0),
    priceEconomy: Yup.number().required("Required").min(0),
    priceSmallSUV: Yup.number().required("Required").min(0),
    priceStandardSUV: Yup.number().required("Required").min(0),
    type: Yup.string().required("Type is required"),
  });

  useEffect(() => {
    setLoading(true); // Set loading to true when fetching starts
    const unsubscribe = onSnapshot(collection(db, "addons"), (querySnapshot) => {
      const addonsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Addon[];
      setAddons(addonsData);
      setLoading(false); // Set loading to false when data is fetched
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (values: Addon, { resetForm }: any) => {
    setApiLoader(true); // Show loader for Add/Edit
    try {
      if (editingAddon) {
        const addonRef = doc(db, "addons", editingAddon.id!);
        await updateDoc(addonRef, values as any);
      } else {
        await addDoc(collection(db, "addons"), values);
      }
      resetForm();
      setIsModalOpen(false);
      setEditingAddon(null);
    } catch (error) {
      console.error("Error saving addon:", error);
    } finally {
      setApiLoader(false); // Hide loader
    }
  };

  const handleEdit = (addon: Addon) => {
    setEditingAddon(addon);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setApiLoader(true); // Show loader for Delete
    try {
      await deleteDoc(doc(db, "addons", id));
    } catch (error) {
      console.error("Error deleting addon:", error);
    } finally {
      setApiLoader(false); // Hide loader
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-lg">
      <div className="flex justify-end items-center mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          onClick={() => { setEditingAddon(null); setIsModalOpen(true); }}
        >
          Add New
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {addons.map((addon) => (
              <tr key={addon.id} className="bg-gray-700 hover:bg-gray-600">
                <td className="p-2 border">{addon.name}</td>
                <td className="p-2 border">{addon.type}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleEdit(addon)}
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded mr-2"
                    disabled={apiLoader}
                  >
                    {apiLoader ? "Loading..." : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDelete(addon.id!)}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                    disabled={apiLoader}
                  >
                    {apiLoader ? "Loading..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-99999">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full  h-[100vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingAddon ? "Edit Addon" : "Add New Addon"}</h2>
            <Formik
              initialValues={{
                name: editingAddon?.name || "",
                description: editingAddon?.description || "",
                perDay: editingAddon?.perDay || false,
                price7Seater: editingAddon?.price7Seater || 0,
                priceEconomy: editingAddon?.priceEconomy || 0,
                priceSmallSUV: editingAddon?.priceSmallSUV || 0,
                priceStandardSUV: editingAddon?.priceStandardSUV || 0,
                type: editingAddon?.type || "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  {/* Name and Description in a row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block">Name</label>
                      <Field type="text" name="name" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                    </div>
                    <div>
                      <label className="block">Description</label>
                      <Field as="textarea" name="description" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                      <ErrorMessage name="description" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  {/* Type and Per Day in a row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block">Type</label>
                      <Field as="select" name="type" className="w-full p-2 rounded bg-gray-800 border border-gray-700">
                        <option value="">Select Type</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                      </Field>
                      <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
                    </div>
                    <div>
                      <label className="block">Per Day</label>
                      <Field type="checkbox" name="perDay" className="mt-3" />
                      <ErrorMessage name="perDay" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  {/* Prices in a row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block">Price (7-Seater)</label>
                      <Field type="number" name="price7Seater" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                      <ErrorMessage name="price7Seater" component="div" className="text-red-500 text-sm" />
                    </div>
                    <div>
                      <label className="block">Price (Economy)</label>
                      <Field type="number" name="priceEconomy" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                      <ErrorMessage name="priceEconomy" component="div" className="text-red-500 text-sm" />
                    </div>
                    <div>
                      <label className="block">Price (Small SUV)</label>
                      <Field type="number" name="priceSmallSUV" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                      <ErrorMessage name="priceSmallSUV" component="div" className="text-red-500 text-sm" />
                    </div>
                    <div>
                      <label className="block">Price (Standard SUV)</label>
                      <Field type="number" name="priceStandardSUV" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                      <ErrorMessage name="priceStandardSUV" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="bg-gray-500 px-4 py-2 rounded"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || apiLoader}
                      className="bg-green-500 px-4 py-2 rounded"
                    >
                      {apiLoader ? "Loading..." : editingAddon ? "Update" : "Add"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddonsForm;