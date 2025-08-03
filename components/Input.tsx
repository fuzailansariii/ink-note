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
  disabled?: boolean;
}

export default function Input({
  placeholder,
  type,
  icon: Icon,
  register,
  error,
  disabled,
}: InputProps) {
  return (
    <>
      <label className="font-quicksand border-neutral flex items-center rounded-[4px] border py-2 pl-2 text-sm font-semibold text-white focus:ring-1">
        {Icon && <Icon className="inline-block" />}
        <input
          {...register}
          placeholder={placeholder}
          type={type}
          className="font-nunito mx-1 w-full rounded-sm bg-transparent px-1 text-base text-white outline-none placeholder:text-neutral-500"
          disabled={disabled}
        />
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </>
  );
}
