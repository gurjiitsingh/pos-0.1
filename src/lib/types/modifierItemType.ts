import { z } from "zod";

export const newModifierItemSchema = z.object({
  name: z.string().min(2, "Name required"),
  groupId: z.string().min(1, "Group required"),
  price: z.coerce.number().min(0),
  sortOrder: z.coerce.number().optional(),
  status: z.enum(["published", "draft"]),
  isDefault: z.boolean().optional(),
});

export type TnewModifierItemSchema = z.infer<typeof newModifierItemSchema>;