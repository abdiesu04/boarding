import { z } from "zod";

// Create a more comprehensive schema with password confirmation
export const clientSchema = z.object({
  // Personal Info
  firstName: z.string()
    .min(2, { message: "First name is required" })
    .regex(/^[a-zA-Z\s-']+$/, { message: "First name can only contain letters, spaces, hyphens, and apostrophes" }),
  lastName: z.string()
    .min(2, { message: "Last name is required" })
    .regex(/^[a-zA-Z\s-']+$/, { message: "Last name can only contain letters, spaces, hyphens, and apostrophes" }),
  ssn: z.string()
    .min(11, { message: "Please enter a valid SSN (XXX-XX-XXXX)" })
    .regex(/^\d{3}-\d{2}-\d{4}$/, { message: "Please enter a valid SSN (XXX-XX-XXXX)" }),
  dob: z.string()
    .min(1, { message: "Date of birth is required" })
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const minAge = 18;
      const maxAge = 100;
      
      // Calculate age
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= minAge && age <= maxAge;
    }, { message: "You must be at least 18 years old to register" }),
  phone: z.string()
    .min(10, { message: "Please enter a valid phone number" })
    .regex(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, { message: "Please enter a valid phone number" }),
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .refine((email) => email.includes("@") && email.includes("."), { 
      message: "Please enter a valid email address" 
    }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: "Password must include uppercase, lowercase, and numbers" }),
  confirmPassword: z.string()
    .min(1, { message: "Please confirm your password" }),

  // Address Info
  address: z.string().min(3, { message: "Address is required (at least 3 characters)" }),
  city: z.string()
    .min(2, { message: "City is required" })
    .regex(/^[a-zA-Z\s-'.]+$/, { message: "City name can only contain letters, spaces, hyphens, and apostrophes" }),
  state: z.string()
    .min(2, { message: "State is required" }),
  zip: z.string()
    .min(1, { message: "ZIP code is required" }),

  // Financial Info
  hasMortgage: z.boolean().default(false),
  loanAmount: z.string()
    .min(1, { message: "Loan amount is required" })
    .refine((val) => !isNaN(Number(val.replace(/[^0-9.-]+/g, ""))), { 
      message: "Please enter a valid amount"
    })
    .refine((val) => Number(val.replace(/[^0-9.-]+/g, "")) > 0, {
      message: "Loan amount must be greater than $0"
    }),
  monthlyIncome: z.string()
    .min(1, { message: "Monthly income is required" })
    .refine((val) => !isNaN(Number(val.replace(/[^0-9.-]+/g, ""))), { 
      message: "Please enter a valid amount"
    })
    .refine((val) => Number(val.replace(/[^0-9.-]+/g, "")) > 0, {
      message: "Monthly income must be greater than $0"
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});