import { Token as TokenDTO } from "@dto/Token";
import { User as UserDTO } from "@dto/User";
import { UserType } from "@models/UserType";
import { ErrorDTO } from "@models/dto/ErrorDTO";
import { Network as NetworkDTO } from "@dto/Network";
import { Gateway as GatewayDTO } from "@dto/Gateway";
import { Sensor as SensorDTO } from "@dto/Sensor";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { Measurements as MeasurementsDTO } from "@dto/Measurements";
import { Stats as StatsDTO } from "@dto/Stats";
import { UserDAO } from "@models/dao/UserDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";


export function createErrorDTO(
  code: number,
  message?: string,
  name?: string
): ErrorDTO {
  return removeNullAttributes({
    code,
    name,
    message
  }) as ErrorDTO;
}

export function createTokenDTO(token: string): TokenDTO {
  return removeNullAttributes({
    token: token
  }) as TokenDTO;
}

export function createUserDTO(
  username: string,
  type: UserType,
  password?: string
): UserDTO {
  return removeNullAttributes({
    username,
    type,
    password
  }) as UserDTO;
}

export function mapUserDAOToDTO(userDAO: UserDAO): UserDTO {
  return createUserDTO(userDAO.username, userDAO.type);
}

// ----- Network Mapping -----
export function createNetworkDTO(
  code: string,
  name?: string,
  description?: string,
  gateways?: GatewayDAO[]
): NetworkDTO {

  const gatewaysDTO = gateways ? gateways.map((g) => mapGatewayDAOToDTO(g)) : undefined;

  return removeNullAttributes({
    code,
    name,
    description,
    gateways: gatewaysDTO
  }) as NetworkDTO;
}

export function mapNetworkDAOToDTO(networkDAO: NetworkDAO): NetworkDTO {
  return createNetworkDTO(networkDAO.code, networkDAO.name, networkDAO.description, networkDAO.gateways);
}

// ----- Gateway Mapping -----
export function createGatewayDTO(
  macAddress: string,
  name?: string,
  description?: string,
  sensors?: SensorDAO[]
): GatewayDTO {

  const sensorsDTO = sensors ? sensors.map((s) => mapSensorDAOToDTO(s)) : undefined;

  return removeNullAttributes({
    macAddress,
    name,
    description,
    sensors: sensorsDTO
  }) as GatewayDTO;
}

export function mapGatewayDAOToDTO(gatewayDAO: GatewayDAO): GatewayDTO {
  return createGatewayDTO(gatewayDAO.macAddress, gatewayDAO.name, gatewayDAO.description, gatewayDAO.sensors);
}

// ----- Sensor Mapping -----
export function createSensorDTO(
  macAddress: string,
  name?: string,
  description?: string,
  variable?: string,
  unit?: string
): SensorDTO {

  return removeNullAttributes({
    macAddress,
    name,
    description,
    variable,
    unit
  }) as SensorDTO;
}

export function mapSensorDAOToDTO(sensorDAO: SensorDAO): SensorDTO {
  return createSensorDTO(sensorDAO.macAddress, sensorDAO.name, sensorDAO.description, sensorDAO.variable, sensorDAO.unit);
}

// ----- Measurement Mapping -----
export function createMeasurementDTO(
  createdAt: Date,
  value: number,
): MeasurementDTO {
  return removeNullAttributes({
    createdAt,
    value,
    isOutlier : undefined
  }) as MeasurementDTO;
}

export function mapMeasurementDAOToDTO(measurementDAO: MeasurementDAO): MeasurementDTO {
  return createMeasurementDTO(measurementDAO.createdAt, measurementDAO.value);
}

// ----- Measurements Mapping -----
export function createMeasurementsDTO(
  sensorMacAddress: string,
  stats?: StatsDTO,
  measurements?: Array<MeasurementDTO>
): MeasurementsDTO {
  return removeNullAttributes({
    sensorMacAddress,
    stats,
    measurements
  }) as MeasurementsDTO;
}

export function mapMeasurementsToDTO(
  sensorMacAddress: string,
  stats?: StatsDTO,
  measurements?: Array<MeasurementDTO>
): MeasurementsDTO {
  return createMeasurementsDTO(sensorMacAddress, stats, measurements);
}

// ----- Stats Mapping -----
export function createStatsDTO(
  mean: number,
  variance: number,
  upperThreshold: number,
  lowerThreshold: number,
  startDate?: Date,
  endDate?: Date
): StatsDTO {
  return removeNullAttributes({
    startDate,
    endDate,
    mean,
    variance,
    upperThreshold,
    lowerThreshold
  }) as StatsDTO;
}

export function mapStatsToDTO( stats: {
  startDate?: Date,
  endDate?: Date,
  mean: number,
  variance: number,
  upperThreshold: number,
  lowerThreshold: number
}): StatsDTO {
  return createStatsDTO(stats.mean, stats.variance, stats.upperThreshold, stats.lowerThreshold, stats.startDate, stats.endDate);
}

function removeNullAttributes<T>(dto: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(dto).filter(
      ([_, value]) =>
        value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0)
    )
  ) as Partial<T>;
}
