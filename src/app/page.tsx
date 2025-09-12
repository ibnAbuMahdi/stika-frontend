"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Redirect to login page
    window.location.href = "/auth/login";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded text-white text-sm font-bold flex items-center justify-center mx-auto mb-4">
          S
        </div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}