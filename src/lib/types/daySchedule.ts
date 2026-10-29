import { z } from "zod";

export const dayScheduleSchema = z
  .object({
    day: z.string().optional(),
    isOpen: z.boolean().optional(),
    fullDay: z.boolean().optional(),

    amOpen: z.string().optional(),
    amClose: z.string().optional(),

    pmOpen: z.string().optional(),
    pmClose: z.string().optional(),
  })
  .refine(
    (data) => {
      // If closed → no need for times
      if (!data.isOpen) return true;

      // Full day → only AM times required
      if (data.fullDay) {
        return !!data.amOpen && !!data.amClose;
      }

      // Split shift → both AM + PM required
      return (
        !!data.amOpen &&
        !!data.amClose &&
        !!data.pmOpen &&
        !!data.pmClose
      );
    },
    {
      message: "Invalid opening hours configuration",
    }
  );

export type DayScheduleType = z.infer<typeof dayScheduleSchema>;


export type DaySchedule = {
  day: string;
  isOpen: boolean;
  amOpen: string;
  amClose: string;
};