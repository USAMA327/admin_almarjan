// types.ts
export interface Car {
    id: string;
    name: string;
    brand: string;
    from: number; // AED
    passengers: number;
    isAuto: boolean;
    hasAC: boolean;
    photoURL: string; // Direct URL of the car photo
}
  
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  disabled: boolean;
  nationality?: string; // Additional fields from Firestore
  phone?: string;
  createdAt?: string;
}

export interface Package {
  id?: string; // Optional because it will be added by Firestore
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

// Define Image type
export type ImageData = {
  id: string;
  url: string;
  name: string;
};
