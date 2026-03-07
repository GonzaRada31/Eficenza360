import { Injectable } from '@nestjs/common';
import { EmissionFactor } from '@prisma/client';

export interface OccActivityRequest {
  activityId: string;
  activityType: string;
  activityValue: number;
  activityUnit: string;
}

export interface OccCalculationResult {
  activityId: string;
  emissions: number;
  unit: string;
}

@Injectable()
export class OccService {
  processActivity(
    activity: OccActivityRequest,
    factor: EmissionFactor,
  ): OccCalculationResult {
    const emissions = this.calculateEmission(activity, factor);
    return {
      activityId: activity.activityId,
      emissions,
      unit: 'kgCO2e', // Normalized output
    };
  }

  calculateEmission(
    activity: OccActivityRequest,
    factor: EmissionFactor,
  ): number {
    switch (activity.activityType) {
      case 'electricity':
        return this.calculateElectricityEmissions(
          activity.activityValue,
          factor.factorValue,
        );
      case 'fuel':
        return this.calculateFuelEmissions(
          activity.activityValue,
          factor.factorValue,
        );
      case 'transport':
        return this.calculateTransportEmissions(
          activity.activityValue,
          factor.factorValue,
        );
      default:
        // Generic fallback multiplication
        return activity.activityValue * factor.factorValue;
    }
  }

  aggregateEmissions(calculations: OccCalculationResult[]): number {
    return calculations.reduce((acc, curr) => acc + curr.emissions, 0);
  }

  private calculateElectricityEmissions(
    kwh: number,
    factorValue: number,
  ): number {
    return kwh * factorValue;
  }

  private calculateFuelEmissions(liters: number, factorValue: number): number {
    return liters * factorValue;
  }

  private calculateTransportEmissions(
    distance: number,
    factorValue: number,
  ): number {
    // specific business logic for transport
    return distance * factorValue;
  }
}
