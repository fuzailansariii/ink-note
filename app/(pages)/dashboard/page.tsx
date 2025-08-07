"use client";
import React from "react";
import { useClerk } from "@clerk/nextjs";

export default function dashboard() {
  const { signOut } = useClerk();

  return (
    <div>
      <h1 className="font-quicksand text-3xl font-semibold">Dashboard</h1>
      <p className="font-nunito mt-4 text-lg">
        Welcome to your dashboard! Here you can manage your notes and settings.
      </p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
