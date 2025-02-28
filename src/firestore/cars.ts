import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Car } from "@/types/types";

export const fetchCars = async (): Promise<Car[]> => {
  try {
    const q = query(collection(db, "cars"), orderBy("name")); // Add ordering for faster query performance
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Car[];
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw new Error("Failed to fetch cars. Please try again.");
  }
};
