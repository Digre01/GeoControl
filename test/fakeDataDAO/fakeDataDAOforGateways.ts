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


export const FAKE_DATA = {
    FAKE_NETWORKS: FAKE_NETWORKS,
    FAKE_GATEWAYS: FAKE_GATEWAYS
}