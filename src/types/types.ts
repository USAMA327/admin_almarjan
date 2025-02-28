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