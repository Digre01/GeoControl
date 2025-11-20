import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { SensorDAO } from "@dao/SensorDAO";
import { Sensor as SensorDTO } from "@dto/Sensor";
import { findOrThrowNotFound, findManyOrThrowNotFound, throwConflictIfFound } from "@utils";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";

export class SensorRepository {
  private repo: Repository<SensorDAO>;
  private gatewayRepo: Repository<GatewayDAO>;
  private networkRepo: Repository<NetworkDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(SensorDAO);
    this.gatewayRepo = AppDataSource.getRepository(GatewayDAO);
    this.networkRepo = AppDataSource.getRepository(NetworkDAO);
  }


  async getAllSensors(networkCode: string, gatewayMac: string): Promise<SensorDAO[]> {

    /*
    return findManyOrThrowNotFound(
        await this.repo.find({ where: { 
                                gateway: {
                                    macAddress: gatewayMac,
                                    network: {
                                        code: networkCode
                                    }
                                } 
                            },
                            relations: ["gateway", "gateway.network"]
                        }),
        () => true,
        `Sensors not found`
      );
      */
    findOrThrowNotFound(
      await this.networkRepo.find({ where: { code: networkCode } }),
        () => true,
        `Network with code '${networkCode}' not found`
    );

    findOrThrowNotFound(
      await this.gatewayRepo.find({ where: { 
                                      macAddress: gatewayMac,
                                      network: {
                                          code: networkCode
                                      }
                                  },
                                  relations: ["network"]
                          }),
      () => true,
      `Gateway with code '${gatewayMac}' not found`
    );

    const sensors = await this.repo.find({ where: { 
                                            gateway: {
                                              macAddress: gatewayMac,
                                              network: {
                                                code: networkCode
                                              }
                                            }  
                                          },
                                  relations: ["gateway", "gateway.network"]
                                  });
        
    return sensors
  }


  async getSensorByMacAddress(networkCode: string, gatewayMac: string, macAddress: string): Promise<SensorDAO> {
    return findOrThrowNotFound(
      await this.repo.find({ where: { 
                              macAddress: macAddress,
                              gateway: {
                                macAddress: gatewayMac,
                                network: {
                                    code: networkCode
                                }
                            } 
                        },
                        relations: ["gateway", "gateway.network"]
                      }),
      () => true,
      `Sensor with Mac Address '${macAddress}' not found`
    );
  }


  async createSensor(
    networkCode: string,
    gatewayMac: string,
    sensorDto: SensorDTO
  ): Promise<SensorDAO> {

    throwConflictIfFound(
      await this.repo.find({ where: { 
        macAddress: sensorDto.macAddress,
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
        }
      }
       }),
      () => true,
      `Sensor with macAddress '${sensorDto.macAddress}' already exists`
    );


    const gateway = findOrThrowNotFound(
      await this.gatewayRepo.find({ where: { 
                                      macAddress: gatewayMac,
                                      network: {
                                        code: networkCode
                                      }
                                    },
                                    relations: {
                                        network: true,
                                      }
                                  }),
      () => true,
      `Gateway with Mac Address '${gatewayMac}' not found`
    ); 


    return this.repo.save({
      macAddress: sensorDto.macAddress,
      name: sensorDto.name ?? null,
      description: sensorDto.description ?? null,
      variable: sensorDto.variable ?? null,
      unit: sensorDto.unit ?? null,
      gateway: gateway,
    });
  }


  async updateSensor(
    networkCode: string, 
    gatewayMac: string, 
    macAddress: string,
    updates: SensorDTO
  ): Promise<void> {

    const sensor = await this.getSensorByMacAddress(networkCode, gatewayMac, macAddress);

    //controllo se il macAddress è stato cambiato.
    //se sì, controllo se il nuovo è valido
    if (updates.macAddress && updates.macAddress !== macAddress) {

      throwConflictIfFound(
        await this.repo.find({ where: { 
          macAddress: updates.macAddress,
          gateway: {
            macAddress: gatewayMac,
            network: {
              code: networkCode
            }
          }
         },
         relations: ["gateway", "gateway.network"]
         }),
        () => true,
        `Sensor with macAddress '${updates.macAddress}' already exists`
      );

      sensor.macAddress = updates.macAddress;

    }

    if (updates.name !== undefined) sensor.name = updates.name;
    if (updates.description !== undefined) sensor.description = updates.description;
    if (updates.variable !== undefined) sensor.variable = updates.variable;
    if (updates.unit !== undefined) sensor.unit = updates.unit;

    await this.repo.save(sensor);

}


  async deleteSensor(networkCode: string, gatewayMac: string, macAddress: string): Promise<void> {
    await this.repo.remove(await this.getSensorByMacAddress(networkCode, gatewayMac, macAddress));
  }
}
