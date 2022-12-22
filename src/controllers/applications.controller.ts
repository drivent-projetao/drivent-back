import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import applicationsService from "@/services/applications-service";

export async function postApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const { activityId } = req.body;

    if (!activityId) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    const application = await applicationsService.postApplicationById(userId, Number(activityId));
    return res.status(httpStatus.OK).send({
      id: application.id,
      activityId: application.activityId,
    });
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
