import { z } from "zod";

export const signUpSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  country_id: z.number().min(1, "Country is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms",
  }),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;