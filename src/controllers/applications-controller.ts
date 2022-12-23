import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import applicationsService from "@/services/applications-service";

export async function getApplications(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;

    const applications = await applicationsService
      .getApplications(userId);
      
    return res.status(httpStatus.OK).send(applications);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function getApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const activityId = Number(req.params.activityId);
    console.log(activityId);

    if (!activityId) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    const application = await applicationsService
      .findApplicationByActivityId(userId, activityId);
      
    return res.status(httpStatus.OK).send({
      id: application.id,
      activityId: application.activityId,
    });
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
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

    return res.status(httpStatus.OK).send({
      id: application.id,
      activityId: application.activityId,
    });
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function deleteApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const activityId = Number(req.params.activityId);

    if (!activityId) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    await applicationsService
      .deleteApplication(userId, activityId);

    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
