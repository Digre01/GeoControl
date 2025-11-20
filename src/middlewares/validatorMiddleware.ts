import { CONFIG } from "@config";
import { middleware } from "express-openapi-validator";

export const validatorHandler = middleware({
    apiSpec: CONFIG.SWAGGER_V1_FILE_PATH,
    validateRequests: true,
    validateResponses: true,
});