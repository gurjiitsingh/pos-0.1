import { z } from "zod";

export type MasterCategoryType = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;

  sortOrder?: number;

  isActive?: boolean;
};

export const masterCategorySchema = z.object({
  id: z.string().optional(),

  name: z
    .string()
    .trim()
    .min(1, "Master category name is required")
    .max(50, "Maximum 50 characters"),

  description: z.string().optional(),

  sortOrder: z.string().optional(),

  image: z.any().optional(),

  icon: z.string().optional(),

  isActive: z.string().optional(),
});

export type TMasterCategorySchema =
  z.infer<typeof masterCategorySchema>;