import { z } from "zod";

// Minimal registration schema for first step
export const registerSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z
    .string()
    .min(10, { message: "Please enter a valid phone number" })
    .regex(/^(\(\d{3}\) \d{3}-\d{4})$/, { message: "Phone number must be in format (XXX) XXX-XXXX" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
