"use client";
import Button from "@/components/button";
import Container from "@/components/container";
import Input from "@/components/Input";
import { Separator } from "@/components/ui/separator";
import Email from "@/icons/email";
import Password from "@/icons/password";
import { signInSchema } from "@/schemas/zodSchema";
import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export default function SignIn() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    try {
      if (!isLoaded) return;
      // Handle sign-in logic
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.error("Sign-in failed:", result);
        throw new Error("Sign-in failed, please try again.");
      }
      reset(); // Reset the form after successful submission
    } catch (error) {
      if (error instanceof Error) {
        console.error("Sign-in error:", error.message);
      } else {
        console.error("An unexpected error occurred during sign-in.");
      }
    }
  };

  return (
    <Container>
      <div className="flex h-screen items-center justify-evenly">
        <div className="mx-4 flex w-full flex-col gap-7 rounded-md px-5 py-10 shadow-xl md:w-2/5">
          <h1 className="font-quicksand text-neutral text-3xl font-semibold">
            iNK Note
          </h1>
          <div className="flex flex-col">
            <h2 className="font-nunito text-neutral2 text-center text-xl font-semibold">
              Login to your account
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
              <p className="font-nunito text-end text-xs">
                <Link
                  href={"/forgot-password"}
                  className="text-blue-500 underline"
                >
                  forgot password
                </Link>
              </p>
              <Button type="submit" isSubmitting={isSubmitting}>
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            <p className="font-nunito text-center text-xs text-neutral-300">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-blue-500 underline">
                create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
