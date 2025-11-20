import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { GatewayDAO } from "@dao/GatewayDAO";
import { Gateway as GatewayDTO } from "@dto/Gateway";
import { findOrThrowNotFound, throwConflictIfFound, findManyOrThrowNotFound } from "@utils";
import { NetworkDAO } from "@models/dao/NetworkDAO";

export class GatewayRepository {
  private repo: Repository<GatewayDAO>;
  private networkRepo: Repository<NetworkDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(GatewayDAO);
    this.networkRepo = AppDataSource.getRepository(NetworkDAO);
  }

    async getAllGateways(networkCode: string): Promise<GatewayDAO[]> {
        
        findOrThrowNotFound(
            await this.networkRepo.find({ where: { code: networkCode } }),
            () => true,
            `Network with code '${networkCode}' not found`
        );

        const gateways = await this.repo.find({ where: { 
                                      network: {
                                          code: networkCode
                                      }
                                  },
                                  relations: ["network", "sensors"]
                          });
        
        return gateways
            
    }
 
 
   async getGatewayByMacAddress(networkCode: string, macAddress: string): Promise<GatewayDAO> {
     return findOrThrowNotFound(
       await this.repo.find({ where: { 
                                 macAddress: macAddress,
                                 network: {
                                     code: networkCode
                                 }
                             },
                             relations: ["network", "sensors"]
                       }),
       () => true,
       `Gateway with Mac Address '${macAddress}' not found`
     );
   }
 
 
    async createGateway(
      networkCode: string,
      gatewayDto: GatewayDTO
    ): Promise<GatewayDAO> {
  
      throwConflictIfFound(
        await this.repo.find({ where: { 
          macAddress: gatewayDto.macAddress,
          network: {
            code: networkCode,
          }
         },
         relations: {
          network: true
        }
         }),
        () => true,
        `Gateway with macAddress '${gatewayDto.macAddress}' already exists`
      );
  
  
      const network = findOrThrowNotFound(
        await this.networkRepo.find({ where: { 
                                        code: networkCode
                                      },
                                    }),
        () => true,
        `Network with code '${networkCode}' not found`
      ); 
  
  
      return this.repo.save({
        macAddress: gatewayDto.macAddress,
        name: gatewayDto.name ?? null,
        description: gatewayDto.description ?? null,
        network: network
      });
    }
  
  
    async updateGateway(
      networkCode: string, 
      macAddress: string,
      updates: GatewayDTO
    ): Promise<void> {
  
      const gateway = await this.getGatewayByMacAddress(networkCode, macAddress);
  
      if (updates.macAddress && updates.macAddress !== macAddress) {
  
        throwConflictIfFound(
          await this.repo.find({ where: { 
            macAddress: updates.macAddress,
            network: {
              code: networkCode
            }
           },
           relations: ["network", "sensors"]
           }),
          () => true,
          `Gateway with macAddress '${updates.macAddress}' already exists`
        );
  
        gateway.macAddress = updates.macAddress;
  
      }
  
      if (updates.name !== undefined) gateway.name = updates.name;
      if (updates.description !== undefined) gateway.description = updates.description;
  
      await this.repo.save(gateway);
  
  }
  
  
    async deleteGateway(networkCode: string, macAddress: string): Promise<void> {
      await this.repo.remove(await this.getGatewayByMacAddress(networkCode, macAddress));
    }
  }  