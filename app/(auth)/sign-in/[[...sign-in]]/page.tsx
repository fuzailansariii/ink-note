"use client";
import Button from "@/components/button";
import Container from "@/components/container";
import Input from "@/components/Input";
import { Separator } from "@/components/ui/separator";
import Email from "@/icons/email";
import Google from "@/icons/google";
import Password from "@/icons/password";
import Link from "next/link";
import React from "react";

export default function SignIn() {
  return (
    <Container>
      <div className="flex justify-evenly h-screen items-center">
        <div className="flex flex-col px-5 py-10 gap-7 rounded-md shadow-xl w-full md:w-2/5 mx-4">
          <h1 className="text-3xl font-semibold font-quicksand">iNK Note</h1>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold font-nunito">
              Login to your account
            </h2>
            <p className="text-sm font-light font-nunito text-gray-500">
              Welcome back! Select method to Sign In
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
            <form className="flex flex-col gap-4">
              <Input placeholder="Email" type={"email"} icon={Email} />
              <Input placeholder="Password" type={"password"} icon={Password} />
              <p className="text-xs font-nunito text-end">
                <Link
                  href={"/forgot-password"}
                  className="text-blue-500 underline"
                >
                  forgot password
                </Link>
              </p>
              <Button type="submit">Sign In</Button>
            </form>
            <p className="text-xs text-center font-nunito">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-blue-500 underline">
                create an account
              </Link>
            </p>
          </div>
        </div>
        <div className="hidden md:block">Hello World</div>
      </div>
    </Container>
  );
}
