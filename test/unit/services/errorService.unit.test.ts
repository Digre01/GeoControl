import * as errorService from "@services/errorService"
import { createErrorDTO } from "@services/mapperService";
import { ErrorDTO, instanceOfErrorDTO } from "@models/dto/ErrorDTO";
import AppError from "@models/errors/AppError";

jest.mock('@services/mapperService');

const mockCreateErrorDTO = createErrorDTO as jest.MockedFunction<typeof createErrorDTO>;

describe('createAppError', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockCreateErrorDTO.mockImplementation((code, message, name) => ({
            code,
            message,
            name
        } as ErrorDTO));
    });

    it('generic error', () => {
        const genericError = new Error('Test error');

        const result = errorService.createAppError(genericError);

        expect(instanceOfErrorDTO(result)).toBe(true);
        expect(result.code).toBe(500);
        expect(result.message).toBe('Test error');
        expect(result.name).toBe('InternalServerError');
    });

    it('AppError with override of default values', () => {
        const appError = new AppError('App error', 400);

        const result = errorService.createAppError(appError);

        expect(instanceOfErrorDTO(result)).toBe(true);
        expect(result.code).toBe(400);
        expect(result.message).toBe("App error");
        expect(result.name).toBe("Error");
    });

    it('from complete error', () => {
        const error = { status: 404, message: 'Not found', name: 'NotFound' };

        const result = errorService.createAppError(error);

        expect(instanceOfErrorDTO(result)).toBe(true);
        expect(result.code).toBe(404);
        expect(result.message).toBe('Not found');
        expect(result.name).toBe('NotFound');
    });

    it('null value', () => {
        const result = errorService.createAppError(null);

        expect(instanceOfErrorDTO(result)).toBe(true);
        expect(result.code).toBe(500);
        expect(result.message).toBe('Internal Server Error');
        expect(result.name).toBe('InternalServerError');
    });

    it('non-numeric status', () => {
        const errorWithStringStatus = { status: 'invalid', message: 'Test' };

        const result = errorService.createAppError(errorWithStringStatus);

        expect(instanceOfErrorDTO(result)).toBe(true);
        expect(result.code).toBe(500);
        expect(result.message).toBe('Test');
        expect(result.name).toBe('InternalServerError');
    });
});