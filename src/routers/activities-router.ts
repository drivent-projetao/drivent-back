import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getActivities, getNumberOfUsersByActivity } from "@/controllers";

const activitiesRouter = Router();

activitiesRouter.all("/*", authenticateToken).get("/", getActivities).get("/:activityId", getNumberOfUsersByActivity);

export { activitiesRouter };
