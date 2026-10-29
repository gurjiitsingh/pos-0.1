import { Timestamp } from "firebase/firestore";
import { z } from "zod";

export type userType = {
    id:string;
    email:string;
hashedPassword:string;
isAdmin:string;
isVerfied:string;
role:string;
username:string;
time:string | undefined;
createdAt?: Timestamp; // Firestore server timestamp
}




export const userSchima = z.object({
  username: z
  .string()
  .trim()
  .min(2, { message: "User name is very short" })
  .max(30, { message: "User name is very long" }),
  password:z.string().optional(),
  confirmPassword:z.string().optional(),
   email: z.string().min(2, { message: "Email is required" }),
 
});

export type TuserSchem = z.infer<typeof userSchima>;



export const signUpSchema = z
  .object({
    username: z.string().min(2, { message: "User name is required" }),
    email: z.string().email().min(2, { message: "Email is required" }),
    password: z
      .string()
      .min(4, { message: "Password must be atleast 4 character long" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password must match",
    path: ["confirmPassword"],
  });

export type TsignUpSchema = z.infer<typeof signUpSchema>;