import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getActivitiesDates } from "@/controllers";

const activitiesRouter = Router();

activitiesRouter.all("/*", authenticateToken).get("/dates", getActivitiesDates);

export { activitiesRouter };
