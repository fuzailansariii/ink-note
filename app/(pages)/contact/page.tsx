"use client";
import Container from "@/components/container";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactUsSchema } from "@/schemas/zodSchema";
import Input from "@/components/Input";

export default function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof contactUsSchema>>({
    resolver: zodResolver(contactUsSchema),
  });

  const onSubmit = async (data: z.infer<typeof contactUsSchema>) => {
    console.log("Contact form submitted:", data);
  };

  return (
    <Container className="h-screen flex items-center justify-center">
      <div>
        <h1 className="text-3xl font-semibold font-quicksand text-center my-10">
          Contact Us
        </h1>
        <p className="text-center text-gray-600 mb-5">
          We would love to hear from you! Please reach out with any questions or
          feedback.
        </p>
        <form className="max-w-md mx-auto" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <Input
              placeholder="Enter your name"
              type="text"
              register={register("fullName")}
              error={errors.fullName?.message}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Email
            </label>
            <Input
              placeholder="Enter your email"
              type="email"
              register={register("fullName")}
              error={errors.fullName?.message}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <Input
              placeholder="You message here"
              type="text"
              error={errors.message?.message}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Send Message
          </button>
        </form>
      </div>
    </Container>
  );
}
