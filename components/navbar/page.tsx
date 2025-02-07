"use client"; // Required for Clerk hooks in Next.js App Router

import React from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn } = useUser(); // Check if user is logged in

  return (
    <header>
      <nav className="bg-white shadow-md fixed w-full z-30 top-0 start-0 border-b border-gray-300">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link href="/" className="flex items-center space-x-3">
            <img src="/image/logo/logo3.png" alt="Logo" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center space-x-4 md:order-2">
            {!isSignedIn && (
              <Link href="/sign-up" legacyBehavior>
                <a className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium shadow-md hover:bg-blue-700 transition-all duration-300">
                  Sign Up
                </a>
              </Link>
            )}
            {isSignedIn ? (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 border-2 border-white shadow-lg", 
                  },
                }}
              />
            ) : (
              <Link href="/sign-in" legacyBehavior>
                <a className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white font-semibold shadow-lg transition-all duration-300 border-2 border-white">
                  <img
                    src="/image/profile/profile.jpg"
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                </a>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
