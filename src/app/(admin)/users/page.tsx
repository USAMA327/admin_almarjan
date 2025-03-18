"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHeader } from "@/components/ui/table";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { LockIcon, TrashBinIcon } from "@/icons";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import Loader from "@/components/mine/Loader";
import { ConfirmationModal } from "@/components/mine/ConfirmationModal";
import Button from "@/components/ui/button/Button";
import { TableRow } from "@/components/ui/table";

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  disabled: boolean;
  role: "admin" | "user"; // Add role field
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiLoader, setApiLoader] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ uid: string; action: "block" | "delete" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/users");
      setUsers(data.users);
    
    } catch (err: any) {
      setError(err.response?.data?.error || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (uid: string, disabled: boolean) => {
    setApiLoader(true);
    try {
      await axios.put(`/api/users/${uid}/block`, { disabled: !disabled });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, disabled: !disabled } : user
        )
      );
    } catch (err) {
      toast.error("Error updating user status!");
      console.error("Error updating user status:", err);
    } finally {
      setApiLoader(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    setApiLoader(true);
    try {
      await axios.delete(`/api/users/${uid}/delete`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.uid !== uid));
    } catch (err) {
      toast.error("Error while deleting user!");
      console.error("Error deleting user:", err);
    } finally {
      setApiLoader(false);
    }
  };

  const handleUpdateRole = async (uid: string, role: "admin"  | "user") => {
    setApiLoader(true);
    try {
      await axios.put(`/api/users/${uid}/role`, { role });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, role } : user
        )
      );
      toast.success("Role updated successfully!");
    } catch (err) {
      toast.error("Error updating user role!");
      console.error("Error updating user role:", err);
    } finally {
      setApiLoader(false);
    }
  };

  const openModal = (uid: string, action: "block" | "delete") => {
    setSelectedUser({ uid, action });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const confirmAction = () => {
    if (selectedUser) {
      if (selectedUser.action === "block") {
        const user = users.find((u) => u.uid === selectedUser.uid);
        if (user) {
          handleBlockUser(user.uid, user.disabled);
        }
      } else if (selectedUser.action === "delete") {
        handleDeleteUser(selectedUser.uid);
      }
    }
    closeModal();
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.displayName == searchTerm ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader/>
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100 dark:border-white/[0.05]">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">User</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">Role</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <Link href={`/users/${user.uid}`}>
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          {user.photoURL ? (
                            <Image width={40} height={40} src={user.photoURL} alt={user.displayName} />
                          ) : (
                            <div className="w-10 h-10 flex justify-center items-center bg-white overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                              <p className="font-semibold "> {user.email.charAt(0).toLocaleUpperCase()}</p>
                            </div>
                          )}
                        </div>
                      </Link>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{user.displayName}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{user.email}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <select
                      value={user.role ? user.role : "user"}
                      onChange={(e) => handleUpdateRole(user.uid, e.target.value as "admin" | "user")}
                      className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color={user.disabled ? "error" : "success"}>
                      {user.disabled ? "Blocked" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="">
                    <div className="flex gap-3">
                      <Button
                        onClick={() => openModal(user.uid, "block")}
                        className={user.disabled ? "border bg-success-500 hover:bg-success-600" : "bg-warning-500 hover:bg-warning-600"}
                        disabled={apiLoader}
                        size="sm"
                        variant="primary"
                        startIcon={<LockIcon />}
                      >
                        {user.disabled ? "Unblock" : "Block"}
                      </Button>

                      <Button
                        onClick={() => openModal(user.uid, "delete")}
                        className={"bg-error-500 hover:bg-error-600"}
                        disabled={apiLoader}
                        size="sm"
                        variant="primary"
                        startIcon={<TrashBinIcon />}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmAction}
        title={selectedUser?.action === "delete" ? "Delete User" : selectedUser?.action === "block" ? "Block/Unblock User" : ""}
        message={
          selectedUser?.action === "delete"
            ? "Are you sure you want to delete this user?"
            : selectedUser?.action === "block"
              ? "Are you sure you want to block/unblock this user?"
              : ""
        }
      />
    </div>
  );
}