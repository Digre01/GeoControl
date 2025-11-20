import { SensorDAO } from "@dao/SensorDAO";
import { FAKE_DATA as FAKE_GATEWAYS_DATA } from "./fakeDataDAOforGateways";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";

const FAKE_NETWORKS: NetworkDAO[] = [
    Object.assign(new NetworkDAO(), { id: 1, code: "NET01", name: "Rete 1", description: "Rete Network 1", gateways: [] }),
    Object.assign(new NetworkDAO(), { id: 2, code: "NET04", name: "Rete 4", description: "Rete Network 4", gateways: [] }),
    Object.assign(new NetworkDAO(), { id: 3, code: "NET08", name: "Rete 8", description: "Rete Network 8", gateways: [] })
]

const FAKE_GATEWAYS: GatewayDAO[] = [
    Object.assign(new GatewayDAO(), { id: 1, macAddress: "AA:BB:CC:DD:EE:FF", name: "Gateway 5", description: "Gateway numero 5", network: { ...FAKE_NETWORKS[0], gateways: undefined }, sensors: [] }),
    Object.assign(new GatewayDAO(), { id: 2, macAddress: "AF:BB:CF:DD:EE:FF", name: "Gateway 7", description: "Gateway numero 7", network: { ...FAKE_NETWORKS[0], gateways: undefined }, sensors: [] }),
    Object.assign(new GatewayDAO(), { id: 3, macAddress: "AF:BC:CF:DD:EE:FF", name: null, description: null, network: { ...FAKE_NETWORKS[0], gateways: undefined }, sensors: [] }),
    Object.assign(new GatewayDAO(), { id: 4, macAddress: "DD:BB:CC:CC:EE:FF", name: "Gateway 11", description: "Gateway numero 11", network: { ...FAKE_NETWORKS[1], gateways: undefined }, sensors: [] }),
    Object.assign(new GatewayDAO(), { id: 5, macAddress: "DD:BB:AA:CC:EE:FF", name: "Gateway 12", description: "Gateway numero 12", network: { ...FAKE_NETWORKS[1], gateways: undefined }, sensors: [] })
]


const FAKE_SENSORS: SensorDAO[] = [
    Object.assign(new SensorDAO(), { id: 1, macAddress: "00:11:22:33:44:55", name: "Sensor 1", description: "Description for Sensor 1", variable: "temperature", unit: "C", gateway: FAKE_GATEWAYS[0], measurements: [] }),
    Object.assign(new SensorDAO(), { id: 2, macAddress: "66:77:88:99:AA:BB", name: "Sensor 2", description: "Description for Sensor 2", variable: "temperature", unit: "C",gateway: FAKE_GATEWAYS[0], measurements: [] }),
    Object.assign(new SensorDAO(), { id: 3, macAddress: "CC:DD:EE:FF:00:11", name: "Sensor 3", description: "Description for Sensor 3", variable: "pressione", unit: "Pa",gateway: FAKE_GATEWAYS[1], measurements: [] }),
    Object.assign(new SensorDAO(), { id: 4, macAddress: "22:33:44:55:66:77", name: "Sensor 4", description: "Description for Sensor 4", variable: "pressione", unit: "Pa",gateway: FAKE_GATEWAYS[1], measurements: [] })
];

export const FAKE_DATA = {
    FAKE_SENSORS: FAKE_SENSORS,
    FAKE_NETWORKS : FAKE_NETWORKS,
    FAKE_GATEWAYS: FAKE_GATEWAYS
};
