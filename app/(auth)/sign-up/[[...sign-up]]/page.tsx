"use client";
import Button from "@/components/button";
import Container from "@/components/container";
import Input from "@/components/Input";
import { Separator } from "@/components/ui/separator";
import Email from "@/icons/email";
import Google from "@/icons/google";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUpSchema } from "@/schemas/zodSchema";

export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    try {
      // Handle sign up logic here
      console.log("Sign up data:", data);
      reset(); // Reset form after successful submission
    } catch (error) {
      console.error("Sign Up Error:", error);
    }
  };

  return (
    <Container>
      <div className="flex justify-evenly h-screen items-center">
        <div className="flex flex-col px-5 py-10 gap-7 rounded-md shadow-xl w-full md:w-2/5 mx-4">
          <h1 className="text-3xl font-semibold font-quicksand">iNK Note</h1>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold font-nunito">Sign Up</h2>
            <p className="text-sm font-light font-nunito text-gray-500">
              Hello! Select method to Sign Up
            </p>
          </div>

          <div className="w-full md:max-w-sm lg:min-w-sm md:mx-auto flex flex-col gap-6 mb-5">
            {/* OAuth */}
            <div className="flex gap-2 font-nunito">
              <Button>
                <Google />
                <span>Google</span>
              </Button>
            </div>

            {/* seperator */}
            <div className="flex items-center gap-2">
              <Separator />
              <p className="text-xs whitespace-nowrap text-gray-500">
                or continue with email
              </p>
              <Separator />
            </div>

            {/* Login form */}
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Input
                placeholder="Email"
                type={"email"}
                icon={Email}
                register={register("email")}
                error={errors.email?.message}
              />
              <Button type="submit" isSubmitting={isSubmitting}>
                Sign Up
              </Button>
            </form>
            <p className="text-xs text-center font-nunito">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-blue-500 underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
        <div className="hidden md:block">Hello World</div>
      </div>
    </Container>
  );
}
