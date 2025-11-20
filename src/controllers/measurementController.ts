import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { Measurements as MeasurementsDTO } from "@dto/Measurements";
import { Stats as StatsDTO } from "@dto/Stats";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { mapStatsToDTO, mapMeasurementDAOToDTO, mapMeasurementsToDTO } from "@services/mapperService";
import { calculateOutliers, calculateStats } from "@services/statsService";

// Creazione di una misurazione
export async function createMeasurement(networkCode: string, gatewayMac: string, sensorMac: string, measurementDto: MeasurementDTO): Promise<void> {
  const measurementRepo = new MeasurementRepository();
  await measurementRepo.createMeasurement(networkCode, gatewayMac, sensorMac, measurementDto);
}

// Get delle misurazioni di un sensor
export async function getSensorMeasurements(networkCode: string, gatewayMac: string, sensorMac: string, startDate?: string, endDate?: string): Promise<MeasurementsDTO> {
  const measurementRepo = new MeasurementRepository();
  const measurementsDAO = await measurementRepo.getSensorMeasurements(networkCode, gatewayMac, sensorMac, startDate, endDate);
  const stats = mapStatsToDTO(calculateStats(measurementsDAO, startDate, endDate));
  const measurementsDTO = measurementsDAO.map((m) => mapMeasurementDAOToDTO(m));
  const outliersDTO = calculateOutliers(stats, measurementsDTO);
  return mapMeasurementsToDTO(sensorMac, stats, outliersDTO)

}


// Get delle misurazioni di una network
export async function getNetworkMeasurements(networkCode: string, sensorsMacs?: string[], startDate?: string, endDate?: string): Promise<MeasurementsDTO[]> {
  let result = [];
  const measurementRepo = new MeasurementRepository();
  const arrayMeasurementsDAO = await measurementRepo.getNetworkMeasurements(networkCode, sensorsMacs, startDate, endDate);
  for (let element of arrayMeasurementsDAO) {

    if (element.measurements.length !== 0) {

      const stats = mapStatsToDTO(calculateStats(element.measurements, startDate, endDate));
      const measurementsDTO = element.measurements.map((m) => mapMeasurementDAOToDTO(m));
      const outliersDTO = calculateOutliers(stats, measurementsDTO);

      result.push(mapMeasurementsToDTO(element.sensorMacAddress, stats, outliersDTO));
    }
    else {
      result.push(mapMeasurementsToDTO(element.sensorMacAddress));
    }
  }
  return result
}


// Get delle stats di un sensor
export async function getSensorStats(networkCode: string, gatewayMac: string, sensorMac: string, startDate?: string, endDate?: string): Promise<StatsDTO | undefined> {
  const measurementRepo = new MeasurementRepository();
  const measurementsDAO = await measurementRepo.getSensorMeasurements(networkCode, gatewayMac, sensorMac, startDate, endDate);
  return mapStatsToDTO(calculateStats(measurementsDAO, startDate, endDate))
}


// Get delle stats di una network
export async function getNetworkStats(networkCode: string, sensorsMacs?: string[], startDate?: string, endDate?: string): Promise<MeasurementsDTO[]> {
  let result = [];
  const measurementRepo = new MeasurementRepository();
  const arrayMeasurementsDAO = await measurementRepo.getNetworkMeasurements(networkCode, sensorsMacs, startDate, endDate);
  for (let element of arrayMeasurementsDAO) {
    if (element.measurements.length !== 0) {
      const stats = mapStatsToDTO(calculateStats(element.measurements, startDate, endDate));
      result.push(mapMeasurementsToDTO(element.sensorMacAddress, stats));
    }
    else {
      result.push(mapMeasurementsToDTO(element.sensorMacAddress));
    }

  }
  return result
}

// Get degli outlier di un sensor
export async function getSensorOutliers(networkCode: string, gatewayMac: string, sensorMac: string, startDate?: string, endDate?: string): Promise<MeasurementsDTO> {
  const measurementRepo = new MeasurementRepository();
  const measurementsDAO = await measurementRepo.getSensorMeasurements(networkCode, gatewayMac, sensorMac, startDate, endDate);
  if (measurementsDAO.length !== 0) {
    const stats = mapStatsToDTO(calculateStats(measurementsDAO, startDate, endDate));
    const measurementsDTO = measurementsDAO.map((m) => mapMeasurementDAOToDTO(m));
    const outliersDTO = calculateOutliers(stats, measurementsDTO);

    return mapMeasurementsToDTO(sensorMac, stats, outliersDTO.filter(o => o.isOutlier))
  }
  else {
    return mapMeasurementsToDTO(sensorMac)
  }

}

// Get degli outliers di una network
export async function getNetworkOutliers(networkCode: string, sensorsMacs?: string[], startDate?: string, endDate?: string): Promise<MeasurementsDTO[]> {
  let result = [];
  const measurementRepo = new MeasurementRepository();
  const arrayMeasurementsDAO = await measurementRepo.getNetworkMeasurements(networkCode, sensorsMacs, startDate, endDate);
  for (let element of arrayMeasurementsDAO) {
    if (element.measurements.length !== 0) {
      const stats = mapStatsToDTO(calculateStats(element.measurements, startDate, endDate));
      const measurementsDTO = element.measurements.map((m) => mapMeasurementDAOToDTO(m));
      const outliersDTO = calculateOutliers(stats, measurementsDTO);

      result.push(mapMeasurementsToDTO(element.sensorMacAddress, stats, outliersDTO.filter(o => o.isOutlier)));
    }
    else {
      result.push(mapMeasurementsToDTO(element.sensorMacAddress));
    }
  }
  return result
}