import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getApplications, getApplication, postApplication, deleteApplication } from "@/controllers";

const applicationsRouter = Router();

applicationsRouter
  .all("/*", authenticateToken)
  .get("/", getApplications)
  .get("/:activityId", getApplication)
  .post("/", postApplication)
  .delete("/:activityId", deleteApplication);

export { applicationsRouter };
