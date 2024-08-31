import { z } from 'zod';

export const confirmMeasureSchema = z.object({
  measure_uuid: z.string().uuid(),
  confirmed_value: z.number(),
});

export type ConfirmMeasureDTO = z.infer<typeof confirmMeasureSchema>;
