import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getActivitiesDates, getActivitiesWithLocation, getNumberOfUsersByActivity } from "@/controllers";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("/dates", getActivitiesDates)
  .get("/:date", getActivitiesWithLocation)
  .get("/availableSlots/:activityId", getNumberOfUsersByActivity);
  
export { activitiesRouter };
