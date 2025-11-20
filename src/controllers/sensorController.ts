import { Sensor as SensorDTO } from "@dto/Sensor";
import { SensorRepository } from "@repositories/SensorRepository";
import { mapSensorDAOToDTO } from "@services/mapperService";

export async function getAllSensors(networkCode: string, gatewayMac: string): Promise<SensorDTO[]> {
  const sensorRepo = new SensorRepository();
  return (await sensorRepo.getAllSensors(networkCode, gatewayMac)).map(mapSensorDAOToDTO);
}

export async function getSensor(networkCode: string, gatewayMac: string, macAddress: string): Promise<SensorDTO> {
  const sensorRepo = new SensorRepository();
  return mapSensorDAOToDTO(await sensorRepo.getSensorByMacAddress(networkCode, gatewayMac, macAddress));
}

export async function createSensor(networkCode: string, gatewayMac: string, sensorDto: SensorDTO): Promise<void> {
  const sensorRepo = new SensorRepository();
  await sensorRepo.createSensor(networkCode, gatewayMac, sensorDto);
}

export async function updateSensor(networkCode: string, gatewayMac: string, macAddress: string, sensorDto: SensorDTO): Promise<void> {
    const sensorRepo = new SensorRepository();
    await sensorRepo.updateSensor(networkCode, gatewayMac, macAddress, sensorDto);
}

export async function deleteSensor(networkCode: string, gatewayMac: string, macAddress: string): Promise<void> {
  const sensorRepo = new SensorRepository();
  await sensorRepo.deleteSensor(networkCode, gatewayMac, macAddress);
}
