import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicket,
  createPayment,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
  createHotel,
  createRoomWithHotelId,
  createLocale,
  createActivity,
  createApplication
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /applications", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/applications");
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
  
    const response = await server.get("/applications").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.get("/applications").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  describe("when token is valid", () => {
    it("should respond with status 401 when user ticket is remote ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
  
      const response = await server.get("/applications").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 when user has no payment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
  
      const createdHotel = await createHotel();
      await createRoomWithHotelId(createdHotel.id);
  
      const response = await server.get("/applications").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 404 when user has no application", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    
      const createdHotel = await createHotel();
      await createRoomWithHotelId(createdHotel.id);
    
      const response = await server.get("/applications").set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
  
    it("should respond with status 200 when user has application", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      await createRoomWithHotelId(createdHotel.id);

      const locale = await createLocale("local teste");
      const activityParams = {
        date: new Date("2022-12-24T09:00:00"),
        startTime: new Date("2022-12-24T09:00:00"),
        endTime: new Date("2022-12-24T10:00:00"),
      };
      const activity = await createActivity(activityParams, locale);
      const application = await createApplication({ activityId: activity.id, userId: user.id });
  
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([{
        id: application.id,
        activityId: activity.id,
        capacity: activity.capacity,
        date: activity.date,
        startTime: activity.startTime,
        endTime: activity.endTime
      }]);
    });
  });
});
