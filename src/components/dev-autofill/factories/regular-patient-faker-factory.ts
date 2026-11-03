import { PatientProfileGenerator, type DynamicProfileOptions } from '../core';

export class RegularPatientFakerFactory {
  private constructor() {}

  public static generate(options?: DynamicProfileOptions): {
    values: Record<string, string>;
  } {
    const profile = PatientProfileGenerator.generate(options);
    return {
      values: PatientProfileGenerator.toRecord(profile)
    };
  }
}
