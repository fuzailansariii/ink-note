"use client";
import React from "react";
import { useClerk } from "@clerk/nextjs";

export default function dashboard() {
  const { signOut } = useClerk();

  return (
    <div>
      <h1 className="text-3xl font-semibold font-quicksand">Dashboard</h1>
      <p className="mt-4 text-lg font-nunito">
        Welcome to your dashboard! Here you can manage your notes and settings.
      </p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
