import { FAKE_DATA } from "./fakeDataDAOforMeasurements";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { SensorRepository } from "@repositories/SensorRepository";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { mapGatewayDAOToDTO, mapSensorDAOToDTO, mapMeasurementDAOToDTO } from "@services/mapperService";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { UserDAO } from "@models/dao/UserDAO";
import { UserRepository } from "@repositories/UserRepository";


/// ATTENZIONE: Le seguenti funzioni sono da usare solo se è in uso il TestDataSource
export async function createFakeUsers(fakeUsers: UserDAO[]) {
    const repo = new UserRepository();

    for (let user of fakeUsers) {
        await repo.createUser(
            user.username,
            user.password,
            user.type
        );
    }
}

export async function createFakeNetworks(fakeNetworks: NetworkDAO[]) {
    const repo = new NetworkRepository();

    for (let network of fakeNetworks) {
        await repo.createNetwork(
            network.code,
            network.name,
            network.description
        );
    }
}

export async function createFakeGateways(fakeGateways: GatewayDAO[]) {
    const repo = new GatewayRepository();

    for (let gateway of fakeGateways) {
        await repo.createGateway(
            gateway.network.code,
            mapGatewayDAOToDTO(gateway)
        );
    }
}

export async function createFakeSensors(fakeSensors: SensorDAO[]) {
    const repo = new SensorRepository();

    for (let sensor of fakeSensors) {
        await repo.createSensor(
            sensor.gateway.network.code,
            sensor.gateway.macAddress,
            mapSensorDAOToDTO(sensor)
        );
    }
}

export async function createFakeMeasurement(fakeMeasurements: MeasurementDAO[]) {
    const repo = new MeasurementRepository();

    for (let meas of fakeMeasurements) {
        await repo.createMeasurement(
            meas.sensor.gateway.network.code,
            meas.sensor.gateway.macAddress,
            meas.sensor.macAddress,
            mapMeasurementDAOToDTO(meas)
        );
    }
}