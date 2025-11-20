import { NetworkDAO } from "@models/dao/NetworkDAO";

const FAKE_NETWORKS: NetworkDAO[] = [
    Object.assign(new NetworkDAO(), { id: 1, code: "NET01", name: "Rete 1", description: "Rete Network 1", gateways: [] }),
    Object.assign(new NetworkDAO(), { id: 2, code: "NET04", name: "Rete 4", description: "Rete Network 4", gateways: [] }),
    Object.assign(new NetworkDAO(), { id: 3, code: "NET08", name: "Rete 8", description: "Rete Network 8", gateways: [] })
]

export const FAKE_DATA = {
    FAKE_NETWORKS: FAKE_NETWORKS
}