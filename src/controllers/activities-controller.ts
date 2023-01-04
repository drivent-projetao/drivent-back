import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import activitiesService from "@/services/activities-service";

export async function getActivitiesDates(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const activities = await activitiesService.getActivitiesDates(userId);
    return res.status(httpStatus.OK).send(activities);
  } catch (error) {
    if (error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if (error.name === "UnauthorizedError") return res.sendStatus(httpStatus.UNAUTHORIZED);
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function getActivitiesWithLocation(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { date } = req.params;
  let isValidDate = date.replace("-", "");
  isValidDate = isValidDate.replace("-", "");

  const todayDate = new Date();
  const today = todayDate.toISOString().split("T")[0];

  if(!isValidDate || isNaN(Number(isValidDate)) || isValidDate.length !== 8 || date < today) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  const newDate = new Date(date.replace("-", "/"));

  try {
    const activities = await activitiesService.getActivitiesByLocation(userId, newDate);
    return res.status(httpStatus.OK).send(activities);
  } catch (error) {
    if (error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if (error.name === "UnauthorizedError") return res.sendStatus(httpStatus.UNAUTHORIZED);
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function getNumberOfUsersByActivity(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { activityId } = req.params;
  try {
    const numberOfUsers = await activitiesService.getNumberOfUsersByActivityId(userId, Number(activityId));
    return res.send({ numberOfUsers });
  } catch (error) {
    if (error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if (error.name === "UnauthorizedError") return res.sendStatus(httpStatus.UNAUTHORIZED);
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
