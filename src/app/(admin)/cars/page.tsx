"use client"
import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import Loader from "@/components/mine/Loader";

interface Car {
  id?: string;
  airConditioner: boolean;
  bags: number;
  brand: string;
  category: string;
  doors: number;
  image: string;
  isAuto: boolean;
  isTop: boolean;
  name: string;
  number: string;
  passengers: number;
  price: number;
}

interface Image {
  id?: string;
  name: string;
  url: string;
}

const CarsForm = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiLoader, setApiLoader] = useState(false);
  const [images, setImages] = useState<Image[]>([]); // For car images
  const [selectedImage, setSelectedImage] = useState<string>(""); // For image preview

  const validationSchema = Yup.object().shape({
    airConditioner: Yup.boolean().required("Required"),
    bags: Yup.number().required("Required").min(0),
    brand: Yup.string().required("Brand is required"),
    category: Yup.string().required("Category is required"),
    doors: Yup.number().required("Required").min(0),
    image: Yup.string().required("Image URL is required"),
    isAuto: Yup.boolean().required("Required"),
    isTop: Yup.boolean().required("Required"),
    name: Yup.string().required("Name is required"),
    number: Yup.string().required("Number is required"),
    passengers: Yup.number().required("Required").min(0),
    price: Yup.number().required("Required").min(0),
  });

  // Fetch cars and images from Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribeCars = onSnapshot(collection(db, "cars"), (querySnapshot) => {
      const carsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Car[];
      setCars(carsData);
      setLoading(false);
    });

    const unsubscribeImages = onSnapshot(collection(db, "images"), (querySnapshot) => {
      const imagesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Image[];
      setImages(imagesData);
    });

    return () => {
      unsubscribeCars();
      unsubscribeImages();
    };
  }, []);

  const handleSubmit = async (values: Car, { resetForm }: any) => {
    setApiLoader(true);
    try {
      if (editingCar) {
        const carRef = doc(db, "cars", editingCar.id!);
        await updateDoc(carRef, values as any);
      } else {
        await addDoc(collection(db, "cars"), values);
      }
      resetForm();
      setIsModalOpen(false);
      setEditingCar(null);
      setSelectedImage(""); // Reset selected image
    } catch (error) {
      console.error("Error saving car:", error);
    } finally {
      setApiLoader(false);
    }
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setSelectedImage(car.image); // Set selected image for preview
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setApiLoader(true);
    try {
      await deleteDoc(doc(db, "cars", id));
    } catch (error) {
      console.error("Error deleting car:", error);
    } finally {
      setApiLoader(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-lg">
      <div className="flex justify-end items-center mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          onClick={() => { setEditingCar(null); setIsModalOpen(true); setSelectedImage(""); }}
        >
          Add New Car
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border ">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Brand</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id} className="bg-gray-700 hover:bg-gray-600">
                <td className="p-2 border">{car.name}</td>
                <td className="p-2 border">{car.brand}</td>
                <td className="p-2 border">{car.category}</td>
                <td className="p-2 border">${car.price}</td>
                <td className="p-2 border flex justify-center">
                  <img src={car.image} alt={car.name} className=" h-16 object-fit " />
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleEdit(car)}
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded mr-2"
                    disabled={apiLoader}
                  >
                    {apiLoader ? "Loading..." : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDelete(car.id!)}
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
            <h2 className="text-xl font-bold mb-4">{editingCar ? "Edit Car" : "Add New Car"}</h2>
            <Formik
              initialValues={{
                airConditioner: editingCar?.airConditioner || false,
                bags: editingCar?.bags || 0,
                brand: editingCar?.brand || "",
                category: editingCar?.category || "",
                doors: editingCar?.doors || 0,
                image: editingCar?.image || "",
                isAuto: editingCar?.isAuto || false,
                isTop: editingCar?.isTop || false,
                name: editingCar?.name || "",
                number: editingCar?.number || "",
                passengers: editingCar?.passengers || 0,
                price: editingCar?.price || 0,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, setFieldValue, values }) => (
                <Form className="space-y-4">
                  {/* Name, Brand, and Category in a row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block">Name</label>
                      <Field type="text" name="name" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                    </div>
                    <div>
                      <label className="block">Brand</label>
                      <Field type="text" name="brand" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                      <ErrorMessage name="brand" component="div" className="text-red-500 text-sm" />
                    </div>
                    <div>
                      <label className="block">Category</label>
                      <Field type="text" name="category" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                      <ErrorMessage name="category" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  {/* Number, Passengers, and Price in a row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block">Number</label>
                      <Field type="text" name="number" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                      <ErrorMessage name="number" component="div" className="text-red-500 text-sm" />
                    </div>
                    <div>
                      <label className="block">Passengers</label>
                      <Field type="number" name="passengers" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                      <ErrorMessage name="passengers" component="div" className="text-red-500 text-sm" />
                    </div>
                    <div>
                      <label className="block">Price</label>
                      <Field type="number" name="price" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                      <ErrorMessage name="price" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  {/* Doors, Bags, and Image in a row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block">Doors</label>
                      <Field type="number" name="doors" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                      <ErrorMessage name="doors" component="div" className="text-red-500 text-sm" />
                    </div>
                    <div>
                      <label className="block">Bags</label>
                      <Field type="number" name="bags" className="w-full p-2 rounded bg-gray-800 border border-gray-700" />
                      <ErrorMessage name="bags" component="div" className="text-red-500 text-sm" />
                    </div>
                    <div>
                      <label className="block">Image</label>
                      <Field
                        as="select"
                        name="image"
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          setFieldValue("image", e.target.value);
                          setSelectedImage(e.target.value); // Update selected image for preview
                        }}
                      >
                        <option value="">Select Image</option>
                        {images.map((image) => (
                          <option key={image.id} value={image.url}>
                            {image.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="image" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  {/* Image Preview */}
                  {selectedImage && (
                    <div className="flex justify-center">
                      <img src={selectedImage} alt="Selected Car" className=" h-32 object-fit" />
                    </div>
                  )}

                  {/* Air Conditioner, Auto, and Top in a row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block">Air Conditioner</label>
                      <Field type="checkbox" name="airConditioner" className="mt-2" />
                      <ErrorMessage name="airConditioner" component="div" className="text-red-500 text-sm" />
                    </div>
                    <div>
                      <label className="block">Auto</label>
                      <Field type="checkbox" name="isAuto" className="mt-2" />
                      <ErrorMessage name="isAuto" component="div" className="text-red-500 text-sm" />
                    </div>
                    <div>
                      <label className="block">Top</label>
                      <Field type="checkbox" name="isTop" className="mt-2" />
                      <ErrorMessage name="isTop" component="div" className="text-red-500 text-sm" />
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
                      {apiLoader ? "Loading..." : editingCar ? "Update" : "Add"}
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

export default CarsForm;