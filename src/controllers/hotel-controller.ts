import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotels-service";
import httpStatus from "http-status";
import { redisClient } from "@/app";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const hotels = await redisClient.get("hotels");
    if (hotels != null) return res.status(httpStatus.OK).send(hotels);

    const hotelsFromDb = await hotelService.getHotels(Number(userId));
    await redisClient.set("hotels", JSON.stringify(hotelsFromDb));
    return res.status(httpStatus.OK).send(hotelsFromDb);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "cannotListHotelsError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getHotelsWithRooms(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { hotelId } = req.params;

  try {
    const hotelsWithRooms = await redisClient.get("hotelsWithRooms");
    if (hotelsWithRooms != null) return res.status(httpStatus.OK).send(hotelsWithRooms);

    const hotelsWithRoomsFromDb = await hotelService.getHotelsWithRooms(Number(userId), Number(hotelId));
    await redisClient.set("hotelsWithRooms", JSON.stringify(hotelsWithRoomsFromDb));
    return res.status(httpStatus.OK).send(hotelsWithRoomsFromDb);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "cannotListHotelsError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getHotelsWithRoomInfo(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const hotelsWithRoomInfo = await redisClient.get("hotelsWithRoomInfo");
    if (hotelsWithRoomInfo != null) return res.status(httpStatus.OK).send(hotelsWithRoomInfo);

    const hotelsWithRoomInfoFromDb = await hotelService.getHotelsWithRoomInfo(Number(userId));
    await redisClient.set("hotelsWithRoomInfo", JSON.stringify(hotelsWithRoomInfoFromDb));
    return res.status(httpStatus.OK).send(hotelsWithRoomInfoFromDb);
  } catch (error) {
    if (error.name === "cannotListHotelsError") return res.sendStatus(httpStatus.UNAUTHORIZED);
    if (error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
