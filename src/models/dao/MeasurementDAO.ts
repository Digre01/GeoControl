import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { SensorDAO } from "@models/dao/SensorDAO"

@Entity("measurements")
export class MeasurementDAO {

  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ nullable: false })
  createdAt: Date;

  @Column("float", { nullable: false })
  value: number;

  @ManyToOne(() => SensorDAO, (sensor) => sensor.measurements, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: "sensorId" })
  sensor: SensorDAO;

}