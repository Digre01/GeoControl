import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { Stats as StatsDTO } from "@dto/Stats";
import { Measurement as MeasurementDTO } from "@models/dto/Measurement";
import { parseISODateParamToUTC } from "@utils";



export function calculateStats(measurements: MeasurementDAO[], startDate?: string, endDate?: string): StatsDTO {

    const start = startDate === undefined ? undefined : parseISODateParamToUTC(startDate);
    const end = endDate === undefined ? undefined : parseISODateParamToUTC(endDate);

    if (measurements.length === 0) {

        return {
            startDate: start ?? undefined,
            endDate: end ?? undefined,
            mean: 0,
            variance: 0,
            upperThreshold: 0,
            lowerThreshold: 0
        };

    }
    else {

        const values = measurements.map(m => m.value);

        const mean = values.reduce((sum, v) => sum + v / values.length, 0);
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2) / values.length, 0);
        const upperThreshold = mean + 2 * Math.sqrt(variance);
        const lowerThreshold = mean - 2 * Math.sqrt(variance);


        return {
            startDate: start ?? undefined,
            endDate: end ?? undefined,
            mean,
            variance,
            upperThreshold,
            lowerThreshold
        };

    }

}

export function calculateOutliers(stats : StatsDTO, measurements : MeasurementDTO[]) : MeasurementDTO[] {

    const upperThreshold = stats.upperThreshold;
    const lowerThreshold = stats.lowerThreshold;

    const outliersDTO = [];

    for (const measurement of measurements) {

        if (measurement.value < lowerThreshold || measurement.value > upperThreshold ){

            measurement.isOutlier = true;
            outliersDTO.push(measurement);

        }
        else {

            measurement.isOutlier = false;
            outliersDTO.push(measurement);

        }

    }

    return outliersDTO;

}
