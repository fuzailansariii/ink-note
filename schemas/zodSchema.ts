import * as z from "zod";

const emailSchema = z
  .string()
  .min(1, { message: "Email is required" })
  .pipe(z.email({ message: "Invalid email address" }));

export const signUpSchema = z.object({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9]+$/, {
      message: "Username must contain only letters and numbers",
    })
    .min(1, { message: "Username is required" })
    .min(4, { message: "Username must be at least 4 characters" }),
  email: emailSchema,
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .regex(/^(?=.*[A-Z])(?=.*\d).+$/, {
      message:
        "Password must contain at least one uppercase letter and one number",
    }),
});

export const verificationCodeSchema = z.object({
  verificationCode: z
    .string()
    .min(1, { message: "Verification code is required" })
    .max(6, { message: "verification code must be 6 character only" }),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
});
