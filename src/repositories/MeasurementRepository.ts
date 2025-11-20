import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { SensorDAO } from "@models/dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { findOrThrowNotFound, parseISODateParamToUTC } from "@utils";
import { NotFoundError } from "@models/errors/NotFoundError";


export class MeasurementRepository {
  private repo: Repository<MeasurementDAO>;
  private sensor_repo: Repository<SensorDAO>;
  private gateway_repo: Repository<GatewayDAO>;
  private network_repo: Repository<NetworkDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(MeasurementDAO);
    this.sensor_repo = AppDataSource.getRepository(SensorDAO);
    this.gateway_repo = AppDataSource.getRepository(GatewayDAO);
    this.network_repo = AppDataSource.getRepository(NetworkDAO);
  }

  // Creazione di una misurazione
  async createMeasurement(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    measurementDto: MeasurementDTO,
  ): Promise<MeasurementDAO> {

    const sensor = findOrThrowNotFound(
      await this.sensor_repo.find({
        where: {
          macAddress: sensorMac,
          gateway: {
            macAddress: gatewayMac,
            network: {
              code: networkCode
            }
          }
        }
      }),
      () => true,
      `Sensor with mac address '${sensorMac}', gateway mac address '${gatewayMac}'and network code '${networkCode}' not found`
    );


    return this.repo.save({
      createdAt: measurementDto.createdAt,
      value: measurementDto.value,
      isOutlier: measurementDto.isOutlier ?? null,
      sensor: sensor,
    });
  }

  // Get misurazioni di un sensore
  async getSensorMeasurements(networkCode: string, gatewayMac: string, sensorMac: string, startDate?: string, endDate?: string): Promise<MeasurementDAO[]> {

    let measurements = [];

    const start = startDate === undefined ? undefined : parseISODateParamToUTC(startDate);
    const end = endDate === undefined ? undefined : parseISODateParamToUTC(endDate);

    const sensor = findOrThrowNotFound(
      await this.sensor_repo.find({
        where: {
          macAddress: sensorMac,
          gateway: {
            macAddress: gatewayMac,
            network: {
              code: networkCode
            }
          }
        },
        relations: {
          gateway: {
            network: true,
          },
          measurements: true
        }
      }),
      () => true,
      `Sensor with Mac Address '${sensorMac}', associated to Gateway '${gatewayMac}' and Network '${networkCode}', not found`
    );


    measurements = sensor.measurements.filter((m) => {
      if (start && end) return m.createdAt >= start && m.createdAt <= end;
      if (start && !end) return m.createdAt >= start;
      if (!start && end) return m.createdAt <= end;
      return true;
    });

    return measurements;

  }


  // Get misurazioni di una network
  async getNetworkMeasurements(networkCode: string, sensorsMacs?: string[], startDate?: string, endDate?: string):
    Promise<{ sensorMacAddress: string, measurements: MeasurementDAO[] }[]> {

    const measurementsArray = [];

    const start = startDate === undefined ? undefined : parseISODateParamToUTC(startDate);
    const end = endDate === undefined ? undefined : parseISODateParamToUTC(endDate);

    const networkExists = await this.network_repo.findOne({
      where: { code: networkCode }
    });

    if (!networkExists) {
      throw new NotFoundError(`Network with code '${networkCode}' not found`);
    }

    if (!sensorsMacs) {
      const sensors = await this.sensor_repo.find({
        where: {
          gateway: {
            network: {
              code: networkCode
            }
          }
        },
        relations: {
          gateway: {
            network: true,
          },
          measurements: true
        }
      });
      sensorsMacs = sensors.map((m) => m.macAddress);
    }

    for (const sensorMac of sensorsMacs) {

      const sensor = await this.sensor_repo.findOne({
        where: {
          macAddress: sensorMac,
          gateway: {
            network: {
              code: networkCode
            }
          }
        },
        relations: {
          gateway: {
            network: true,
          },
          measurements: true
        }
      });

      if (!sensor)
        continue

      else {

        const measurements = sensor.measurements.filter((m) => {

          if (start && end) return m.createdAt >= start && m.createdAt <= end;
          if (start && !end) return m.createdAt >= start;
          if (!start && end) return m.createdAt <= end;
          return true;

        });

        measurementsArray.push({
          sensorMacAddress: sensorMac,
          measurements: measurements
        });

      }

    }

    return measurementsArray;

  }

}