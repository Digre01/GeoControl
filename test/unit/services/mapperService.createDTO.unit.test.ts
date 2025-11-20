import * as mapperService from "@services/mapperService"
import { Stats as StatsDTO, instanceOfStats } from "@models/dto/Stats";
import { instanceOfToken } from "@models/dto/Token";
import { Measurement as MeasurementDTO, instanceOfMeasurement } from "@models/dto/Measurement";
import { Measurements as MeasuremetnsDTO, instanceOfMeasurements } from "@models/dto/Measurements";
import { Sensor as SensorDTO, instanceOfSensor } from "@models/dto/Sensor";
import { Gateway as GatewayDTO, instanceOfGateway } from "@models/dto/Gateway";
import { Network as NetworkDTO, instanceOfNetwork } from "@models/dto/Network";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforMeasurements";
import { SensorDAO } from "@models/dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";


describe("createStatsDTO", () => {
    const mean = 10;
    const variance = 4;
    const upperThreshold = 18;
    const lowerThreshold = 2;
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-12-31T23:59:59Z');

    it('correct full dto', () => {
        const result = mapperService.createStatsDTO(mean, variance, upperThreshold, lowerThreshold, startDate, endDate);
        expect(result).toEqual({
            mean,
            variance,
            upperThreshold,
            lowerThreshold,
            startDate,
            endDate
        });
        expect(instanceOfStats(result)).toBe(true);
    });

    it('omits startDate', () => {
        const result = mapperService.createStatsDTO(mean, variance, upperThreshold, lowerThreshold, undefined, endDate);
        expect(result).toEqual({
            mean,
            variance,
            upperThreshold,
            lowerThreshold,
            endDate
        });
        expect(result).not.toHaveProperty('startDate');
        expect(instanceOfStats(result)).toBe(true);
    });

    it('omits endDate', () => {
        const result = mapperService.createStatsDTO(mean, variance, upperThreshold, lowerThreshold, startDate);
        expect(result).toEqual({
            mean,
            variance,
            upperThreshold,
            lowerThreshold,
            startDate
        });
        expect(result).not.toHaveProperty('endDate');
        expect(instanceOfStats(result)).toBe(true);
    });

    it('includes only required fields', () => {
        const result = mapperService.createStatsDTO(mean, variance, upperThreshold, lowerThreshold);
        expect(result).toEqual({
            mean,
            variance,
            upperThreshold,
            lowerThreshold
        });
        expect(result).not.toHaveProperty('startDate');
        expect(result).not.toHaveProperty('endDate');
        expect(instanceOfStats(result)).toBe(true);
    });

    it('zero values', () => {
        const result = mapperService.createStatsDTO(0, 0, 0, 0);
        expect(result).toEqual({
            mean: 0,
            variance: 0,
            upperThreshold: 0,
            lowerThreshold: 0
        });
    });

    it('negative values for thresholds and variance', () => {
        const result = mapperService.createStatsDTO(10, -1, -5, -15);
        expect(result).toEqual({
            mean: 10,
            variance: -1,
            upperThreshold: -5,
            lowerThreshold: -15
        });
        expect(instanceOfStats(result)).toBe(true);
    });

    it('large values', () => {
        const result = mapperService.createStatsDTO(10, 343435345, -93843434534, -15);
        expect(result).toEqual({
            mean: 10,
            variance: 343435345,
            upperThreshold: -93843434534,
            lowerThreshold: -15
        });
        expect(instanceOfStats(result)).toBe(true);
    });

    it('startDate and endDate in different timezones', () => {
        const start = new Date('2025-01-01T12:00:00+05:00');
        const end = new Date('2025-01-02T12:00:00-05:00');
        const result = mapperService.createStatsDTO(mean, variance, upperThreshold, lowerThreshold, start, end);
        expect(result.startDate?.toISOString()).toBe('2025-01-01T07:00:00.000Z');
        expect(result.endDate?.toISOString()).toBe('2025-01-02T17:00:00.000Z');
        expect(instanceOfStats(result)).toBe(true);
    });
});

describe("createMeasurementDTO", () => {
    const dateNow = new Date('2025-01-01T12:00:00Z');

    it('includes createdAt and value', () => {
        const result = mapperService.createMeasurementDTO(dateNow, 42);
        expect(result).toEqual({ createdAt: dateNow, value: 42 });
        expect(result).not.toHaveProperty('isOutlier');
        expect(instanceOfMeasurement(result)).toBe(true);
    });

    it('omits isOutlier', () => {
        const result = mapperService.createMeasurementDTO(dateNow, 10);
        expect(result).not.toHaveProperty('isOutlier');
        expect(instanceOfMeasurement(result)).toBe(true);
    });

    it('value equals to zero', () => {
        const result = mapperService.createMeasurementDTO(dateNow, 0);
        expect(result).toEqual({ createdAt: dateNow, value: 0 });
        expect(instanceOfMeasurement(result)).toBe(true);
    });

    it('handles past date correctly', () => {
        const pastDate = new Date('2000-01-01T00:00:00Z');
        const result = mapperService.createMeasurementDTO(pastDate, 100);
        expect(result).toEqual({ createdAt: pastDate, value: 100 });
        expect(instanceOfMeasurement(result)).toBe(true);
    });

    it('future date correctly', () => {
        const futureDate = new Date('2100-01-01T00:00:00Z');
        const result = mapperService.createMeasurementDTO(futureDate, 55);
        expect(result).toEqual({ createdAt: futureDate, value: 55 });
        expect(instanceOfMeasurement(result)).toBe(true);
    });

    it('negative value', () => {
        const result = mapperService.createMeasurementDTO(dateNow, -15);
        expect(result).toEqual({ createdAt: dateNow, value: -15 });
        expect(instanceOfMeasurement(result)).toBe(true);
    });

    it('large value', () => {
        const result = mapperService.createMeasurementDTO(dateNow, -24545642454);
        expect(result).toEqual({ createdAt: dateNow, value: -24545642454 });
        expect(instanceOfMeasurement(result)).toBe(true);
    });
});

describe("createMeasurementsDTO", () => {
    const sensorMacAddress = 'AA:BB:CC:DD:EE:FF';

    const stats: StatsDTO = {
        mean: 25,
        variance: 4,
        upperThreshold: 33,
        lowerThreshold: 17
    };

    const measurements: MeasurementDTO[] = [
        {
            createdAt: new Date('2025-01-01T00:00:00Z'),
            value: 22
        },
        {
            createdAt: new Date('2025-01-01T01:00:00Z'),
            value: 30,
            isOutlier: true
        }
    ];

    it('includes all fields', () => {
        const result = mapperService.createMeasurementsDTO(sensorMacAddress, stats, measurements);

        expect(result).toEqual({
            sensorMacAddress,
            stats,
            measurements
        });

        expect(instanceOfMeasurements(result)).toBe(true);
    });

    it('omits stats when undefined', () => {
        const result = mapperService.createMeasurementsDTO(sensorMacAddress, undefined, measurements);

        expect(result).toEqual({
            sensorMacAddress,
            measurements
        });

        expect(result).not.toHaveProperty('stats');
        expect(instanceOfMeasurements(result)).toBe(true);
    });

    it('omits measurements when undefined', () => {
        const result = mapperService.createMeasurementsDTO(sensorMacAddress, stats, undefined);

        expect(result).toEqual({
            sensorMacAddress,
            stats
        });

        expect(result).not.toHaveProperty('measurements');
        expect(instanceOfMeasurements(result)).toBe(true);
    });

    it('includes only rsensorMacAddress', () => {
        const result = mapperService.createMeasurementsDTO(sensorMacAddress);

        expect(result).toEqual({
            sensorMacAddress
        });

        expect(result).not.toHaveProperty('stats');
        expect(result).not.toHaveProperty('measurements');
        expect(instanceOfMeasurements(result)).toBe(true);
    });

    it('No measurements', () => {
        const result = mapperService.createMeasurementsDTO(sensorMacAddress, stats, []);

        expect(result).toEqual({
            sensorMacAddress,
            stats
        });
        expect(instanceOfMeasurements(result)).toBe(true);
    });
});


describe("createSensorDTO", () => {
    const mac = '11:22:33:44:55:66';

    it('all fields', () => {
        const result = mapperService.createSensorDTO(mac, 'Sensor A', 'Room temperature', 'temp', 'C');

        expect(result).toEqual({
            macAddress: mac,
            name: 'Sensor A',
            description: 'Room temperature',
            variable: 'temp',
            unit: 'C'
        });

        expect(instanceOfSensor(result)).toBe(true);
    });

    it('optional fields when undefined', () => {
        const result = mapperService.createSensorDTO(mac);

        expect(result).toEqual({
            macAddress: mac
        });

        expect(result).not.toHaveProperty('name');
        expect(result).not.toHaveProperty('description');
        expect(result).not.toHaveProperty('variable');
        expect(result).not.toHaveProperty('unit');
        expect(instanceOfSensor(result)).toBe(true);
    });

    it('only macAddress and name', () => {
        const result = mapperService.createSensorDTO(mac, 'Sensor B');

        expect(result).toEqual({
            macAddress: mac,
            name: 'Sensor B'
        });

        expect(instanceOfSensor(result)).toBe(true);
    });

    it('only macAddress and variable', () => {
        const result = mapperService.createSensorDTO(mac, undefined, undefined, 'humidity');

        expect(result).toEqual({
            macAddress: mac,
            variable: 'humidity'
        });

        expect(instanceOfSensor(result)).toBe(true);
    });

    it('empty string for optional fields', () => {
        const result = mapperService.createSensorDTO(mac, '', '', '', '');

        expect(result).toEqual({
            macAddress: mac,
            name: '',
            description: '',
            variable: '',
            unit: ''
        });

        expect(instanceOfSensor(result)).toBe(true);
    });

});

describe("createGatewayDTO", () => {
    const macAddress = FAKE_DATA.FAKE_GATEWAYS[3].macAddress;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('includes all fields', () => {
        const gatewayDAO = FAKE_DATA.FAKE_GATEWAYS[3];

        const sensorsDAO = gatewayDAO.sensors;

        const mappedSensorsDTO: SensorDTO[] = sensorsDAO.map(s => ({
            macAddress: s.macAddress,
            variable: s.variable,
            description: s.description,
            unit: s.unit,
            name: s.name
        }));

        jest.spyOn(mapperService, 'mapSensorDAOToDTO').mockImplementation((sensor: SensorDAO) =>
            mappedSensorsDTO.find(s => s.macAddress === sensor.macAddress)!);

        const result = mapperService.createGatewayDTO(macAddress, gatewayDAO.name, gatewayDAO.description, sensorsDAO);


        expect(result).toEqual({
            macAddress,
            name: gatewayDAO.name,
            description: gatewayDAO.description,
            sensors: mappedSensorsDTO
        });

        expect(instanceOfGateway(result)).toBe(true);
    });

    it('omits sensors when undefined', () => {
        const result = mapperService.createGatewayDTO(macAddress, 'Gateway B', 'Secondary gateway');

        expect(result).toEqual({
            macAddress,
            name: 'Gateway B',
            description: 'Secondary gateway'
        });

        expect(result).not.toHaveProperty('sensors');
        expect(instanceOfGateway(result)).toBe(true);
    });

    it('empty sensors array', () => {
        const result = mapperService.createGatewayDTO(macAddress, undefined, undefined, []);

        expect(result).toEqual({
            macAddress,
        });

        expect(instanceOfGateway(result)).toBe(true);
    });

    it('only required field', () => {
        const result = mapperService.createGatewayDTO(macAddress);

        expect(result).toEqual({ macAddress });
        expect(result).not.toHaveProperty('name');
        expect(result).not.toHaveProperty('description');
        expect(result).not.toHaveProperty('sensors');
        expect(instanceOfGateway(result)).toBe(true);
    });

    it('empty strings for optional fields', () => {
        const result = mapperService.createGatewayDTO(macAddress, '', '', []);

        expect(result).toEqual({
            macAddress,
            name: '',
            description: '',
        });

        expect(instanceOfGateway(result)).toBe(true);
    });
});

describe("createNetworkDTO", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('includes all fields', () => {
        jest.spyOn(mapperService, 'mapGatewayDAOToDTO').mockImplementation((gateway: GatewayDAO) =>
            gatewaysDTO.find(g => g.macAddress === gateway.macAddress)!);

        const neworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewaysDAO = neworkDAO.gateways

        const gatewaysDTO = gatewaysDAO.map((gateway): GatewayDTO => ({
            macAddress: gateway.macAddress,
            name: gateway.name,
            description: gateway.description,
            sensors: gateway.sensors.map(s => ({
                macAddress: s.macAddress,
                variable: s.variable,
                description: s.description,
                unit: s.unit,
                name: s.name
            }))
        }));

        const result = mapperService.createNetworkDTO(neworkDAO.code, neworkDAO.name, neworkDAO.description, gatewaysDAO);

        expect(result).toEqual({
            code: neworkDAO.code,
            name: neworkDAO.name,
            description: neworkDAO.description,
            gateways: gatewaysDTO
        });
        expect(instanceOfNetwork(result)).toBe(true);
    });

    it('omits gateways when undefined', () => {
        const result = mapperService.createNetworkDTO('network123', 'Name', 'Description');

        expect(result).toEqual({
            code: 'network123',
            name: 'Name',
            description: 'Description'
        });
        expect(instanceOfNetwork(result)).toBe(true);
    });

    it('empty gateways array', () => {
        const result = mapperService.createNetworkDTO('network123', undefined, undefined, []);

        expect(result).toEqual({
            code: 'network123',
        });
        expect(instanceOfNetwork(result)).toBe(true);
    });

    it('only required code', () => {
        const result = mapperService.createNetworkDTO('network123');

        expect(result).toEqual({
            code: 'network123'
        });
        expect(instanceOfNetwork(result)).toBe(true);
    });

    it('empty strings for optional fields', () => {
        const result = mapperService.createNetworkDTO('network123', '', '', []);

        expect(result).toEqual({
            code: 'network123',
            name: '',
            description: '',
        });
        expect(instanceOfNetwork(result)).toBe(true);
    });
});

describe("createTokenDTO", () => {
    it('valid token', () => {
        const token = 'token123';
        const result = mapperService.createTokenDTO(token);
        expect(result).toEqual({ token: 'token123' });
        expect(instanceOfToken(result)).toBe(true);

    });

    it('empty token', () => {
        const result = mapperService.createTokenDTO('');
        expect(result).toEqual({ token: '' });
        expect(instanceOfToken(result)).toBe(true);

    });

});