import { Entity, Column,  PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn} from "typeorm";
import { SensorDAO } from "@dao/SensorDAO";
import { NetworkDAO } from "@dao/NetworkDAO";

@Entity("gateways")
export class GatewayDAO {

  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ nullable: false, unique: true })
  macAddress: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => SensorDAO, (sensor) => sensor.gateway, {
        cascade: ['remove'],
        onDelete: 'CASCADE'
  })
  sensors: SensorDAO[];

  @ManyToOne(() => NetworkDAO, (network) => network.gateways, {
        onDelete: 'CASCADE'
    })
  @JoinColumn({name: "networkId"})
  network: NetworkDAO;

}
