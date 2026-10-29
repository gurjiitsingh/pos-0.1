import { z } from "zod";

export const newLocationSchema = z.object({
  name: z.string().min(2, "Village / Town name is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),

  deliveryFee: z.coerce
    .number()
    .min(0, "Delivery Cost is required"),

  minSpend: z.coerce
    .number()
    .min(1, "Minimum Spend is required"),

  deliveryDistance: z.coerce
    .number()
    .optional(),

  notes: z.string().optional(),
});


export type TnewLocationSchema = z.infer<typeof newLocationSchema>;


export type locationType = {
  id?: string;
  name: string;
  city: string;
  state: string;
  deliveryFee: number;
  minSpend: number;
  deliveryDistance?: number | null;
  notes?: string;
  createdAt?: any;
};