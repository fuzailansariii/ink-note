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
    data: z.infer<typeof verificationCodeSchema>
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
    <div className="flex flex-col px-5 py-10 gap-7 rounded-md shadow-xl w-full md:w-2/5">
      <div>
        <h2 className="text-xl font-semibold font-nunito text-center mt-5">
          Verify Your Email
        </h2>
      </div>
      <p className="text-center text-md text-gray-600">
        We have sent a 6-digit verification code to your email address. Please
        enter it below.
      </p>
      <form
        className="flex flex-col gap-5 min-w-72 md:w-2/3 mx-auto mb-5"
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
      <div className="flex justify-center items-center gap-2 text-gray-600">
        <span className="text-sm">Didn't receive the code?</span>
        <span
          role="button"
          onClick={handleResendCode}
          className="underline cursor-pointer hover:text-gray-400 transition-colors duration-200"
        >
          resend
        </span>
      </div>
    </div>
  );
}
