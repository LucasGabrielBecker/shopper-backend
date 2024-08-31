import { z } from 'zod';
import { MeasureType } from '../../../../domain/interfaces/measure';
import { Base64 } from 'js-base64';

export const createMeasureSchema = z.object({
  measure_datetime: z.string().datetime(),
  measure_type: z.nativeEnum(MeasureType),
  image: z.string().refine(Base64.isValid),
  customer_code: z.string(),
});

export type CreateMeasureDTO = z.infer<typeof createMeasureSchema>;
