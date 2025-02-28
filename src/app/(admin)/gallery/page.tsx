"use client";

import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import Image from "next/image";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import imageCompression from 'browser-image-compression';
// Define Image type
type ImageData = {
  id: string;
  url: string;
  name: string;
};

export default function DropzoneGallery() {
    const [images, setImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null); // Track which image is deleting

  // Fetch images from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "images"), (snapshot) => {
      const imageList: ImageData[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ImageData));
        setImages(imageList);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);
    const API_KEY = "1152500473f71c3c34e5df48ccbe51ff"; // Replace with your imgbb API key
    const imgbbUrl = `https://api.imgbb.com/1/upload?key=${API_KEY}`;
  
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        // Compression options
        const options = {
          maxSizeMB: 1, // Max file size 0.5MB
          maxWidthOrHeight: 1024, // Resize if larger than 1024px
          useWebWorker: true,
        };
  
        // Compress image
        const compressedFile = await imageCompression(file, options);
  
        const formData = new FormData();
        formData.append("image", compressedFile);
  
        const response = await axios.post(imgbbUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
  
        if (response.data.success) {
          const imageUrl = response.data.data.url;
          
          // Save compressed image URL to Firestore
          await addDoc(collection(db, "images"), { url: imageUrl, name: file.name });
          return imageUrl;
        } else {
          toast.error("Upload to imgbb failed");
        }
      });
  
      await Promise.all(uploadPromises);
      toast.success("Images uploaded successfully");
    } catch (err) {
      toast.error("Error uploading images");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };
  

 // Handle image delete (only removes from Firestore)
 const handleDelete = async (id: string) => {
    setDeleting(id); // Set deleting state
    try {
      await deleteDoc(doc(db, "images", id));
      toast.success("Image deleted successfully");
    } catch (err) {
      toast.error("Error deleting image");
      console.error(err);
    } finally {
      setDeleting(null); // Reset deleting state
    }
  };

  // Dropzone Setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  return (
    <ComponentCard title="Image Gallery">
      {/* Drag & Drop Upload Area */}
      <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
        <form
          {...getRootProps()}
          className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10
          ${
            isDragActive
              ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
              : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
          }
        `}
        >
          {/* Hidden Input */}
          <input {...getInputProps()} />

          <div className="dz-message flex flex-col items-center !m-0">
            {/* Icon Container */}
            <div className="mb-[22px] flex justify-center">
              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                <svg
                  className="fill-current"
                  width="29"
                  height="28"
                  viewBox="0 0 29 28"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                  />
                </svg>
              </div>
            </div>

            <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
              {uploading ? "Uploading..." : isDragActive ? "Drop Files Here" : "Drag & Drop Files Here"}
            </h4>

            <span className=" text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
              Drag and drop your PNG, JPG, WebP, SVG images here or browse
            </span>

            <span className="font-medium underline text-theme-sm text-brand-500">
              Browse File
            </span>
          </div>
        </form>
      </div>

    {/* Loader while fetching images */}
    {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-300 mt-4">Loading images...</p>
      ) : (
        <div className="flex flex-wrap gap-3 mx-auto mt-6">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative group w-36 h-36 bg-gray-200 dark:bg-gray-800 shadow-md rounded-lg"
          >
            {/* Image */}
            <Image
              src={img.url}
              alt={img.name}
              width={150}
              height={150}
              className="w-full h-full object-contain rounded-lg"
            />
      
            {/* Delete Button */}
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {deleting === img.id ? "..." : "✕"}
            </button>
      
            {/* Copy URL Button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(img.url);
                toast.success("Image URL copied!");
              }}
              className="absolute bottom-2 right-2 bg-gray-700 text-white p-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              📋
            </button>
          </div>
        ))}
      </div>
      
      )}

    </ComponentCard>
  );
}
