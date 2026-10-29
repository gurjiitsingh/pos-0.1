import { z } from "zod";

export const createUserSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name is required"),

    username: z
      .string()
      .min(3, "Username is required"),

    email: z
      .string()
      .email("Invalid email"),

    mobile: z
      .string()
      .min(10, "Invalid mobile number"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string(),

role: z.enum([
  "accountant",
  "admin",
  "captain",
  "cashier",
  "chef",
  "confectioner",
  "customer",
  "delivery",
  "dispatch_operator",
  "driver",
  "employee",
  "head_chef",
  "host",
  "manager",
  "production_manager",
  "production_supervisor",
  "purchase_manager",
  "quality_control",
  "restaurant_manager",
  "sales_executive",
  "sales_manager",
  "shopkeeper",
  "steward",
  "storekeeper",
  "supplier",
  "user",
  "waiter",
  "warehouse_assistant",
]),

    status: z.enum([
      "active",
      "inactive",
    ]),

    employeeId: z
      .string()
      .optional(),

    department: z
      .enum([
        "management",
        "production",
        "sales",
        "inventory",
        "dispatch",
        "delivery",
        "accounts",
        "retail",
      ])
      .optional(),

    address: z
      .string()
      .optional(),

    notes: z
      .string()
      .optional(),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      path: ["confirmPassword"],
      message:
        "Passwords do not match",
    }
  );

export type TCreateUserSchema =
  z.infer<typeof createUserSchema>;