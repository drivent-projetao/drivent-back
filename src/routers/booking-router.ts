import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { bookingRoom, listBooking, changeBooking, countBooking } from "@/controllers";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("", listBooking)
  .get("/:roomId", countBooking)
  .post("", bookingRoom)
  .put("/:bookingId", changeBooking);

export { bookingRouter };
