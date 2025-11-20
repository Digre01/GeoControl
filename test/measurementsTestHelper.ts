import { Measurements as MeasurementsDTO } from "@models/dto/Measurements";

export function computeStats(values: number[]) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const upperThreshold = mean + 2 * stdDev;
    const lowerThreshold = mean - 2 * stdDev;
    return { mean, variance, upperThreshold, lowerThreshold };
}
export function cleanMeasurementsDTO(dto: MeasurementsDTO): MeasurementsDTO {
    if (!dto.measurements || dto.measurements.length === 0) {
        return {
            sensorMacAddress: dto.sensorMacAddress
        };
    }
    return dto;
}

export function cleanStatsIfIsNaN(dto: MeasurementsDTO): MeasurementsDTO {
    const cleaned = { ...dto };

    if (cleaned.stats && Number.isNaN(cleaned.stats.mean)) {
        delete cleaned.stats;
    }

    return cleaned;
}