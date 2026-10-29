import { z } from "zod";

export const clientSchema = z.object({
  clientId: z.string().min(3, "Client ID required"),

  apiKey: z.string().min(5),
  applicationId: z.string().min(5),
  projectId: z.string().min(3),

  // 🔥 NEW FIELDS
  status: z.enum(["active", "expired", "blocked"]),
  renewDate: z.string().min(1, "Renew date required"),
  warningDays: z.coerce.number().min(0),

  maxWaiters: z.coerce.number().min(1),
  maxPOS: z.coerce.number().min(1),
});

export type TClientSchema = z.infer<typeof clientSchema>;