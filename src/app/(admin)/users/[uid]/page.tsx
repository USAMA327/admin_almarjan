'use client'
import React, { useEffect, useState } from "react";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { useParams } from "next/navigation";
import axios from "axios";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { User } from "@/types/types";



export default function UserProfile() {
  const params = useParams();
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch user data from Firebase Authentication
      const { data: authData } = await axios.get(`/api/users/${params.uid}`);
      const authUser = authData.user;

      // Fetch additional user data from Firestore
      const userDocRef = doc(db, "users", `${params.uid}`);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const firestoreUser = userDocSnap.data();
        setUser({ ...authUser, ...firestoreUser }); // Merge data from Auth and Firestore
      } else {
        setUser(authUser); // Use only Auth data if Firestore data doesn't exist
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Error fetching user data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="px-5 py-3 text-white text-start text-theme-xs dark:text-gray-400">Loading user...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {user && (
          <div className="space-y-6">
            <UserMetaCard user={user} />
            <UserInfoCard user={user} />
          </div>
        )}
      </div>
    </div>
  );
}