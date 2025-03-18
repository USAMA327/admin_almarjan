"use client";
import React from "react";
import Image from "next/image";
import Badge from "../ui/badge/Badge";

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  disabled: boolean;
  nationality?:string
}


export default function UserMetaCard({user}:{user:User}) {

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            {
              user.photoURL ?
                
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
             
              <Image
                width={80}
                height={80}
                src={user.photoURL}
                alt="user"
                />
                 
              
                </div>
                :
                <div className="w-20 h-20 flex justify-center items-center bg-white overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                <p className="font-semibold text-3xl"> {user.email.charAt(0).toLocaleUpperCase()}</p>
           
          </div>
            }
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
               {user.displayName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                <Badge size="sm" color={user.disabled ? "error" : "success"}>
                      {user.disabled ? "Blocked" : "Active"}
                    </Badge>
                </p>
               {user.nationality &&  <p className=" dark:text-white/90"> | {user.nationality}</p>
               }
               
              </div>
            </div>
         
          </div>
     
        </div>
      </div>
   
    </>
  );
}
