import { SensorDAO } from "@models/dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { parseISODateParamToUTC } from "@utils";

// ATTENZIONE: Mantenere gli id incrementali (a partire da 1)

const FAKE_NETWORKS: NetworkDAO[] = [
    { id: 1, code: "NET01", name: "Rete 1", description: "Rete Network 1", gateways: [] },
    { id: 2, code: "NET04", name: "Rete 4", description: "Rete Network 4", gateways: [] }
]

const FAKE_GATEWAYS: GatewayDAO[] = [
    { id: 1, macAddress: "AA:BB:CC:DD:EE:FF", name: "Gateway 5", description: "Gateway numero 5", network: FAKE_NETWORKS[0], sensors: [] },
    { id: 2, macAddress: "AF:BB:CF:DD:EE:FF", name: "Gateway 7", description: "Gateway numero 7", network: FAKE_NETWORKS[0], sensors: [] },
    { id: 3, macAddress: "DD:BB:CC:CC:EE:FF", name: "Gateway 11", description: "Gateway numero 11", network: FAKE_NETWORKS[1], sensors: [] },
    { id: 4, macAddress: "DD:BB:AA:CC:EE:FF", name: "Gateway 12", description: "Gateway numero 12", network: FAKE_NETWORKS[1], sensors: [] }

]

for (let fakeNetwork of FAKE_NETWORKS) {
    fakeNetwork.gateways = FAKE_GATEWAYS.filter(g => g.network == fakeNetwork)
}

const FAKE_SENSORS: SensorDAO[] = [
    { id: 1, macAddress: "AF:99:CF:DD:1E:FF", name: "Sensore 2", description: "Questo è il sensore 2", variable: "temperatura", unit: "C", gateway: FAKE_GATEWAYS[0], measurements: [] },
    { id: 2, macAddress: "AF:99:CF:DD:1E:01", name: "Sensore 3", description: "Sensore di umidità", variable: "umidità", unit: "%", gateway: FAKE_GATEWAYS[0], measurements: [] },
    { id: 3, macAddress: "AF:99:CF:DD:1E:02", name: "Sensore 4", description: "Sensore di CO2", variable: "CO2", unit: "ppm", gateway: FAKE_GATEWAYS[1], measurements: [] },
    { id: 4, macAddress: "AF:99:CF:DD:1E:03", name: "Sensore 5", description: "Sensore di temperatura", variable: "temperatura", unit: "C", gateway: FAKE_GATEWAYS[1], measurements: [] },
    { id: 5, macAddress: "AF:99:CF:DD:1E:04", name: "Sensore 6", description: "Sensore di pressione ", variable: "pressione", unit: "Pa", gateway: FAKE_GATEWAYS[2], measurements: [] },
    { id: 6, macAddress: "AF:10:CF:DD:1E:04", name: "Sensore 7", description: "Sensore di pressione ", variable: "pressione", unit: "Pa", gateway: FAKE_GATEWAYS[3], measurements: [] },
    { id: 7, macAddress: "AF:10:CF:DD:1E:05", name: "Sensore 8", description: "Sensore di CO2 ", variable: "CO2", unit: "ppm", gateway: FAKE_GATEWAYS[3], measurements: [] }

];

for (let fakeGateway of FAKE_GATEWAYS) {
    fakeGateway.sensors = FAKE_SENSORS.filter(s => s.gateway == fakeGateway)
}


const FAKE_MEASUREMENTS: MeasurementDAO[] = [
    { id: 1, createdAt: parseISODateParamToUTC("2025-01-18T15:10:00.000Z"), value: 22.5, sensor: FAKE_SENSORS[0] },
    { id: 2, createdAt: parseISODateParamToUTC("2025-01-18T16:10:00.000Z"), value: 23.0, sensor: FAKE_SENSORS[0] },
    { id: 3, createdAt: parseISODateParamToUTC("2025-01-18T17:10:00.000Z"), value: 24.2, sensor: FAKE_SENSORS[0] },

    { id: 4, createdAt: parseISODateParamToUTC("2025-01-18T15:05:00.000Z"), value: 55.3, sensor: FAKE_SENSORS[1] },
    { id: 5, createdAt: parseISODateParamToUTC("2025-01-18T16:05:00.000Z"), value: 58.1, sensor: FAKE_SENSORS[1] },
    { id: 6, createdAt: parseISODateParamToUTC("2025-01-18T17:05:00.000Z"), value: 52.7, sensor: FAKE_SENSORS[1] },

    { id: 7, createdAt: parseISODateParamToUTC("2025-01-18T15:20:00.000Z"), value: 420, sensor: FAKE_SENSORS[2] },
    { id: 8, createdAt: parseISODateParamToUTC("2025-01-18T16:20:00.000Z"), value: 430, sensor: FAKE_SENSORS[2] },
    { id: 9, createdAt: parseISODateParamToUTC("2025-01-18T17:20:00.000Z"), value: 450, sensor: FAKE_SENSORS[2] },

    { id: 10, createdAt: parseISODateParamToUTC("2025-01-18T15:30:00.000Z"), value: 21.1, sensor: FAKE_SENSORS[3] },
    { id: 11, createdAt: parseISODateParamToUTC("2025-01-18T16:30:00.000Z"), value: 22.4, sensor: FAKE_SENSORS[3] },
    { id: 12, createdAt: parseISODateParamToUTC("2025-01-18T17:30:00.000Z"), value: 23.7, sensor: FAKE_SENSORS[3] },

    { id: 13, createdAt: parseISODateParamToUTC("2025-01-18T15:00:00.000Z"), value: 1012, sensor: FAKE_SENSORS[4] },
    { id: 14, createdAt: parseISODateParamToUTC("2025-01-18T16:00:00.000Z"), value: 1013, sensor: FAKE_SENSORS[4] },
    { id: 15, createdAt: parseISODateParamToUTC("2025-01-18T17:00:00.000Z"), value: 1011, sensor: FAKE_SENSORS[4] },

    { id: 16, createdAt: parseISODateParamToUTC("2025-01-18T16:00:00.000Z"), value: 123, sensor: FAKE_SENSORS[6] },
    { id: 17, createdAt: parseISODateParamToUTC("2025-01-18T22:00:00.000Z"), value: 44, sensor: FAKE_SENSORS[6] }
];

for (let fakeSensor of FAKE_SENSORS) {
    fakeSensor.measurements = FAKE_MEASUREMENTS.filter(m => m.sensor == fakeSensor)
}


export const FAKE_DATA = {
    FAKE_NETWORKS: FAKE_NETWORKS,
    FAKE_GATEWAYS: FAKE_GATEWAYS,
    FAKE_SENSORS: FAKE_SENSORS,
    FAKE_MEASUREMENTS: FAKE_MEASUREMENTS
}