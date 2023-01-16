import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import activitiesService from "@/services/activities-service";
import { redisClient } from "@/app";

export async function getActivitiesDates(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const activitiesRedis = await redisClient.get("activitiesDates");
    if(activitiesRedis != null) return res.status(httpStatus.OK).send(activitiesRedis);

    const activities = await activitiesService.getActivitiesDates(userId);
    await redisClient.set("activitiesDates", JSON.stringify(activities));
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

  if (!isValidDate || isNaN(Number(isValidDate)) || isValidDate.length !== 8 || date < today) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  const newDate = new Date(date.replace("-", "/"));

  try {
    const activitiesRedis = await redisClient.get(`activitiesWithLocation_${date}`);
    if(activitiesRedis != null) return res.status(httpStatus.OK).send(activitiesRedis);

    const activities = await activitiesService.getActivitiesByLocation(userId, newDate);
    await redisClient.set(`activitiesWithLocation_${date}`, JSON.stringify(activities));

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
    const numberOfUsersRedis = await redisClient.get(`numberOfUsers_${activityId}`);
    if(numberOfUsersRedis != null) return res.status(httpStatus.OK).send(numberOfUsersRedis);

    const numberOfUsers = await activitiesService.getNumberOfUsersByActivityId(userId, Number(activityId));
    await redisClient.set(`numberOfUsers_${activityId}`, JSON.stringify({ numberOfUsers }));

    return res.send({ numberOfUsers });
  } catch (error) {
    if (error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if (error.name === "UnauthorizedError") return res.sendStatus(httpStatus.UNAUTHORIZED);
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
