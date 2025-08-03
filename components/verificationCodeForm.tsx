import React from "react";
import { useForm } from "react-hook-form";
import Input from "./Input";
import * as z from "zod";
import { verificationCodeSchema } from "@/schemas/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "./button";
import { useSignUp } from "@clerk/nextjs";

interface VerificationCodeFormProps {
  handleVerificationSubmit: (
    data: z.infer<typeof verificationCodeSchema>,
  ) => void;
}

export default function VerificationCodeForm({
  handleVerificationSubmit,
}: VerificationCodeFormProps) {
  const { signUp } = useSignUp();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof verificationCodeSchema>>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: {
      verificationCode: "",
    },
  });

  const onSubmit = (data: z.infer<typeof verificationCodeSchema>) => {
    try {
      handleVerificationSubmit(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Verification error:", error.message);
      } else {
        console.error("Unexpected error during verification:", error);
      }
    }
  };

  const handleResendCode = async () => {
    try {
      if (signUp) {
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error resending verification code:", error.message);
      } else {
        console.error("Unexpected error resending verification code:", error);
      }
    }
  };

  return (
    <div className="mt-30 flex w-full flex-col gap-7 rounded-md px-5 py-10 shadow-lg md:w-2/5">
      <h2 className="font-nunito text-neutral mt-5 text-center text-xl font-semibold">
        Verify Your Email
      </h2>
      <p className="text-md text-center text-gray-600">
        We have sent a 6-digit verification code to your email address. Please
        enter it below.
      </p>
      <form
        className="mx-auto mb-5 flex min-w-72 flex-col gap-5 md:w-2/3"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          type="text"
          placeholder="code"
          register={register("verificationCode")}
          error={errors.verificationCode?.message}
          disabled={isSubmitting}
        />
        <Button type="submit" isSubmitting={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify"}
        </Button>
      </form>
      <div className="flex items-center justify-center gap-2 text-gray-600 font-nunito">
        <span className="text-sm">Didn't receive the code?</span>
        <span
          role="button"
          onClick={handleResendCode}
          className="hover:text-neutral2 cursor-pointer underline transition-colors duration-200"
        >
          resend
        </span>
      </div>
    </div>
  );
}
