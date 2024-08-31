import { randomUUID } from 'crypto';
import { IMeasure, MeasureType } from '../interfaces';

export class Measure implements IMeasure {
  public id: string;
  public image_url: string;
  public customer_code: string;
  public customer_id?: string;
  public value: number;
  public measure_datetime: string;
  public measure_type: MeasureType;
  public has_confirmed: boolean;

  constructor(props: {
    customer_code: string;
    customer_id?: string;
    image_url: string;
    value: number;
    measure_datetime: Date;
    measure_type: MeasureType;
    has_confirmed: boolean;
    id?: string;
  }) {
    this.customer_code = props.customer_code;
    this.customer_id = props.customer_id;
    this.image_url = props.image_url;
    this.value = props.value;
    this.measure_datetime = props.measure_datetime.toISOString();
    this.measure_type = props.measure_type;
    this.has_confirmed = props.has_confirmed;
    this.id = props.id ? props.id : Measure.createMeasureId();
  }

  private static createMeasureId(): string {
    return randomUUID();
  }
}
