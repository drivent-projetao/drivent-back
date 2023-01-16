import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import applicationsService from "@/services/applications-service";
import { redisClient } from "@/app";

export async function getApplications(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;

    const applications = await applicationsService
      .getApplications(userId);
      
    return res.status(httpStatus.OK).send(applications);
  } catch (error) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}

export async function getApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const activityId = Number(req.params.activityId);

    const application = await applicationsService
      .findApplicationByActivityId(userId, activityId);
   
    return res.status(httpStatus.OK).send({
      id: application.id,
      activityId: application.activityId,
    });
  } catch (error) {
    if (error.name === "RequestError") {
      res.sendStatus(httpStatus.BAD_REQUEST);
    }
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
  }
}

export async function postApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const { activityId } = req.body;

    if (!activityId) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    const application = await applicationsService
      .postApplicationById(userId, Number(activityId));
    await redisClient.del(`numberOfUsers_${activityId}`);
    return res.status(httpStatus.OK).send({
      id: application.id,
      activityId: application.activityId,
    });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
  }
}

export async function deleteApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const activityId = Number(req.params.activityId);

    await applicationsService.deleteApplication(userId, activityId);
    await redisClient.del(`numberOfUsers_${activityId}`);

    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
  }
}
