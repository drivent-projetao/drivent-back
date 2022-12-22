import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getActivitiesDates, getActivitiesWithLocation } from "@/controllers";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("/dates", getActivitiesDates)
  .get("/:date", getActivitiesWithLocation);
  
export { activitiesRouter };
