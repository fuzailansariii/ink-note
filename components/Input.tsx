"use client";
import React from "react";
import { IconType } from "react-icons/lib";

interface InputProps {
  placeholder: string;
  type: "text" | "password" | "email";
  icon?: IconType;
}

export default function Input({ placeholder, type, icon: Icon }: InputProps) {
  return (
    <label className="flex items-center border rounded-[4px] pl-2 py-2 text-sm font-quicksand font-semibold">
      {Icon && <Icon className="inline-block" />}
      <input
        placeholder={placeholder}
        type={type}
        className="outline-none px-1 text-base w-full font-nunito"
      />
    </label>
  );
}
