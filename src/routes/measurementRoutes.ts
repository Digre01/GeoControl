import { CONFIG } from "@config";
import { Router } from "express";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import { createMeasurement } from "@controllers/measurementController";
import { getSensorMeasurements, getNetworkMeasurements, getSensorStats, getNetworkStats, getSensorOutliers, getNetworkOutliers } from "@controllers/measurementController";
import { MeasurementFromJSON } from "@models/dto/Measurement";
import { parseStringArrayParam } from "@utils";

const router = Router({ mergeParams: true });

// Store a measurement for a sensor (Admin & Operator)
router.post(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements", authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try{
      for (let m of req.body){
        await createMeasurement(
            req.params.networkCode,
            req.params.gatewayMac,
            req.params.sensorMac,
            MeasurementFromJSON(m)
          )
      }
      res.status(201).send();
    }catch(error){
      next(error);
    }
  }
);

// Retrieve measurements for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try{
      const { startDate, endDate } = req.query;
      res.status(200).json(await getSensorMeasurements(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, startDate as string, endDate as string));
    }catch(error){
      next(error);
    }
  }
);

// Retrieve statistics for a specific sensor
router.get(CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/stats", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]), async (req, res, next) => {
    try{
      const { startDate, endDate } = req.query;
      res.status(200).json(await getSensorStats(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, startDate as string, endDate as string));
    }catch(error){
      next(error);
    }
  }
);

// Retrieve only outliers for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/outliers", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try{
      const { startDate, endDate } = req.query;
      res.status(200).json(await getSensorOutliers(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, startDate as string, endDate as string));
    }catch(error){
      next(error);
    }
  }
);

// Retrieve measurements for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/measurements", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try{
      const { startDate, endDate, sensorMacs } = req.query;
      const sensors = parseStringArrayParam(sensorMacs);
      res.status(200).json(await getNetworkMeasurements(req.params.networkCode, sensors, startDate as string, endDate as string));
    }catch(error){
      next(error);
    }
  }
);

// Retrieve statistics for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/stats",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]), async (req, res, next) => {
      try{
        const { startDate, endDate, sensorMacs } = req.query;
        const sensors = parseStringArrayParam(sensorMacs);
        res.status(200).json(await getNetworkStats(req.params.networkCode, sensors, startDate as string, endDate as string));
      }catch(error){
        next(error);
      }
    }
  );

// Retrieve only outliers for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/outliers",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]), async (req, res, next) => {
    try{
        const { startDate, endDate, sensorMacs } = req.query;
        const sensors = parseStringArrayParam(sensorMacs);
        res.status(200).json(await getNetworkOutliers(req.params.networkCode, sensors, startDate as string, endDate as string));
      }catch(error){
        next(error);
      }
  }
);

export default router;
