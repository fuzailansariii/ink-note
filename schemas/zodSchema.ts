import * as z from "zod";

const emailSchema = z.string().min(1, { message: "Email is required" });
// .pipe(z.email({ message: "Invalid email address" }));

export const signUpSchema = z.object({
  email: emailSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
});
