"use client";
import Button from "@/components/button";
import Container from "@/components/container";
import Input from "@/components/Input";
import { Separator } from "@/components/ui/separator";
import Email from "@/icons/email";
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
import { is } from "drizzle-orm";

export default function SignUp() {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
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
    data: z.infer<typeof verificationCodeSchema>,
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
      <Container className="flex justify-center">
        <VerificationCodeForm handleVerificationSubmit={handleVerification} />
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex h-screen items-center justify-evenly">
        <div className="mx-4 flex w-full flex-col gap-7 rounded-md px-5 py-10 shadow-xl md:w-2/5">
          <h1 className="font-quicksand text-neutral text-3xl font-semibold">
            iNK Note
          </h1>
          <div className="flex flex-col">
            <h2 className="font-nunito text-neutral2 text-center text-xl font-semibold">
              Register a new account
            </h2>
          </div>

          <div className="mb-5 flex w-full flex-col gap-6 md:mx-auto md:max-w-sm lg:min-w-sm">
            {/* seperator */}
            <div className="flex items-center gap-2">
              <Separator />
              <p className="text-xs whitespace-nowrap text-gray-500">
                continue with email
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
                {isSubmitting ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
            <p className="font-nunito text-center text-xs text-neutral-300">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-blue-500 underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
