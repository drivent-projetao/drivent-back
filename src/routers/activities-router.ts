import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getActivities, getActivitiesWithLocation } from "@/controllers";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("/", getActivities)
  .get("/:date", getActivitiesWithLocation);

export { activitiesRouter };
