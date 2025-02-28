'use client'
import React, { useEffect, useState } from "react";
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { useParams } from "next/navigation";
import axios from "axios";

interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string | null;
    disabled: boolean;
  }

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
          const { data } = await axios.get(`/api/users/${params.uid}`);
          console.log(data.user)
        setUser(data.user);
      } catch (err: any) {
        setError(err.response?.data?.error || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    

    if (loading) return <p className="px-5 py-3 text-white text-start text-theme-xs dark:text-gray-400">Loading users...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
  
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
              </h3>
              {
                  user &&
        <div className="space-y-6">
          <UserMetaCard user={user} />
          <UserInfoCard  user={user} />
          <UserAddressCard  user={user} />
        </div>
              }
      </div>
    </div>
  );
}
