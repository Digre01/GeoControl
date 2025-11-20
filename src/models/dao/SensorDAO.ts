import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { GatewayDAO } from "@models/dao/GatewayDAO"
import { MeasurementDAO } from "@models/dao/MeasurementDAO"

@Entity("sensors")
export class SensorDAO {

  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ nullable: false, unique: true })
  macAddress: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  variable: string;

  @Column({ nullable: true })
  unit: string;

  @ManyToOne(() => GatewayDAO, (gateway) => gateway.sensors, {
        onDelete: 'CASCADE'
    })
  @JoinColumn({name: "gatewayId"})
  gateway: GatewayDAO;

  @OneToMany(() => MeasurementDAO, (measurement) => measurement.sensor, {
        cascade: ['remove'],
        onDelete: 'CASCADE'
  })
  measurements: MeasurementDAO[];

}