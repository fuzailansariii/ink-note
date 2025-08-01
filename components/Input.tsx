"use client";
import { register } from "module";
import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { IconType } from "react-icons/lib";

interface InputProps {
  placeholder: string;
  type: "text" | "password" | "email";
  icon?: IconType;
  register?: UseFormRegisterReturn;
  error?: string;
}

export default function Input({
  placeholder,
  type,
  icon: Icon,
  register,
  error,
}: InputProps) {
  return (
    <label className="flex items-center border rounded-[4px] pl-2 py-2 text-sm font-quicksand font-semibold">
      {Icon && <Icon className="inline-block" />}
      <input
        {...register}
        placeholder={placeholder}
        type={type}
        className="outline-none px-1 text-base w-full font-nunito"
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </label>
  );
}
