import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { postApplication } from "@/controllers";

const applicationsRouter = Router();

applicationsRouter
  .all("/*", authenticateToken)
  .post("/", postApplication);

export { applicationsRouter };
