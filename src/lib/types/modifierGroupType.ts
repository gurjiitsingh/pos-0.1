import { z } from "zod";

export const newModifierGroupSchema = z.object({
  name: z.string().min(2, "Name required"),
  minSelection: z.coerce.number().min(0),
  maxSelection: z.coerce.number().min(1),
  sortOrder: z.coerce.number().optional(),
  status: z.enum(["published", "draft"]),
});

export type TnewModifierGroupSchema = z.infer<typeof newModifierGroupSchema>;