import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotels, getHotelsWithRooms, getHotelsWithRoomInfo } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getHotels)
  .get("/info", getHotelsWithRoomInfo)
  .get("/:hotelId", getHotelsWithRooms);

export { hotelsRouter };
