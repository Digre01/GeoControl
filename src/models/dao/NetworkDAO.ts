import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from "typeorm";
import { GatewayDAO } from "@dao/GatewayDAO";

@Entity("networks")
export class NetworkDAO {

    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ nullable: false, unique: true })
    code: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => GatewayDAO, (gateway) => gateway.network, {
        cascade: ['remove'],
        onDelete: 'CASCADE'
    })
    gateways: GatewayDAO[];
}