"use client";
import Button from "@/components/button";
import Container from "@/components/container";
import Input from "@/components/Input";
import { Separator } from "@/components/ui/separator";
import Email from "@/icons/email";
import Google from "@/icons/google";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, z } from "zod";
import { signUpSchema, verificationCodeSchema } from "@/schemas/zodSchema";
import { useSignUp } from "@clerk/nextjs";
import VerificationCodeForm from "@/components/verificationCodeForm";
import { useRouter } from "next/navigation";
import User from "@/icons/user";
import Password from "@/icons/password";

export default function SignUp() {
  const [isVerifying, setIsVerifying] = useState(false);
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return; // Ensure Clerk is loaded before proceeding
    isSubmitting;
    console.log("Is submitting:", isSubmitting);
    try {
      // Handle sign up logic here
      if (!data.email || !data.username || !data.password) {
        throw new Error("All fields are required");
      }
      if (!signUp) {
        throw new Error("SignUp service is not available");
      }
      // Create a new sign-up
      await signUp.create({
        emailAddress: data.email,
        username: data.username,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setIsVerifying(true);
      reset(); // Reset form after successful submission
    } catch (error) {
      console.error("Sign Up Error:", error);
    }
  };

  const handleVerification = async (
    data: z.infer<typeof verificationCodeSchema>
  ) => {
    // Handle verification logic
    if (!signUp || !isLoaded) return;
    isSubmitting;
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: data.verificationCode,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // TODO: EMail verified successfully
        router.push("/dashboard");
      } else {
        console.error("Verification failed:", result.status);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Verification error:", error.message);
      } else {
        console.error("Unexpected error during verification:", error);
      }
    }
  };

  if (isVerifying) {
    return (
      <Container>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Verification in Progress</h2>
            <VerificationCodeForm
              handleVerificationSubmit={handleVerification}
            />
          </div>
        </div>
      </Container>
    );
  }

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
                placeholder="Username"
                type={"text"}
                icon={User}
                register={register("username")}
                error={errors.username?.message}
              />
              <Input
                placeholder="Email"
                type={"email"}
                icon={Email}
                register={register("email")}
                error={errors.email?.message}
              />
              <Input
                placeholder="Password"
                type={"password"}
                icon={Password}
                register={register("password")}
                error={errors.password?.message}
              />
              <div id="clerk-captcha" />
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
