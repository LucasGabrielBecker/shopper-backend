enum MeasureType {
  WATER = 'WATER',
  GAS = 'GAS',
}

interface IMeasure {
  id: string;
  image_url: string;
  customer_code: string;
  measure_datetime: string;
  measure_type: MeasureType;
  has_confirmed: boolean;
  value: number;
}

export { IMeasure, MeasureType };
