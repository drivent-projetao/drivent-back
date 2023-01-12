import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { formatDate, formatTime } from "@/utils/formatDate";
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

const activityParams = {
  capacity: 2,
  date: new Date("2022-12-24T09:00:00"),
  startTime: new Date("2022-12-24T09:00:00"),
  endTime: new Date("2022-12-24T10:00:00"),
};

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
  
      const response = await server.get("/applications").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 200 with empty array when user has no application", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
  
      const locale = await createLocale("local test");
      const activity = await createActivity(activityParams, locale);
      await createApplication(activity.id);
    
      const response = await server.get("/applications").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([]);
    });
  
    it("should respond with status 200 with applications array when user has applications", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const locale = await createLocale("local test");
      const activity = await createActivity(activityParams, locale);
      const application = await createApplication(activity.id, user);
  
      const response = await server.get("/applications").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([{
        id: application.id,
        activityId: activity.id,
        capacity: activity.capacity,
        date: formatDate(activity.date),
        startTime: formatTime(activity.startTime),
        endTime: formatTime(activity.endTime)
      }]);
    });
  });
});

describe("GET /applications/:activityId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/applications/1");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/applications/1").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/applications/1").set("Authorization", `Bearer ${token}`);
    
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
    
      const response = await server.get("/applications/1").set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });
  
    it("should respond with status 401 when user has no payment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    
      const response = await server.get("/applications/1").set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });
  
    it("should respond with status 400 with invalid activity id", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const locale = await createLocale("local test");
      const activity = await createActivity(activityParams, locale);
      await createApplication(activity.id, user);
      
      const response = await server.get(`/applications/${activity.id +1}`).set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });
    
    it("should respond with status 200 when user has application", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
  
      const locale = await createLocale("local test");
      const activity = await createActivity(activityParams, locale);
      const application = await createApplication(activity.id, user);
    
      const response = await server.get(`/applications/${activity.id}`).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: application.id,
        activityId: application.activityId,
      });
    });
  });
});

function createValidBody() {
  return {
    activityId: 1,
  };
}

describe("POST /applications", () => {
  it("should respond with status 401 if no token is given", async () => {
    const validBody = createValidBody();
    const response = await server.post("/applications").send(validBody);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const validBody = createValidBody();
    const response = await server.post("/applications").set("Authorization", `Bearer ${token}`).send(validBody);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const validBody = createValidBody();
    const response = await server.post("/applications").set("Authorization", `Bearer ${token}`).send(validBody);
  
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
    
      const locale = await createLocale("local test");      
      const activity = await createActivity(activityParams, locale);
      
      createValidBody();
      const response = await server
        .post("/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({
          activityId: activity.id,
        });
          
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });
        
    it("should respond with status 401 when user has no payment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    
      const locale = await createLocale("local test");      
      const activity = await createActivity(activityParams, locale);
      
      createValidBody();
      const response = await server
        .post("/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({
          activityId: activity.id,
        });
          
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 400 with a invalid body", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
  
      const response = await server.post("/applications").set("Authorization", `Bearer ${token}`).send({
        activityId: 0,
      });
  
      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 with a invalid body - there's not activityId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const locale = await createLocale("local test");      
      const activity = await createActivity(activityParams, locale);
  
      const response = await server
        .post("/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({
          activityId: activity.id + 1,
        });
  
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 with a invalid body - there's not vacancy", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      
      const locale = await createLocale("local test");      
      const activity = await createActivity(activityParams, locale);
      await createApplication(activity.id);
      await createApplication(activity.id);
        
      const response = await server
        .post("/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({
          activityId: activity.id,
        });
            
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 with a invalid body - invalid date and time", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        
      const locale = await createLocale("local test");      
      const activity = await createActivity(activityParams, locale);
      const otherActivity = await createActivity(activityParams, locale);
      await createApplication(activity.id, user);
          
      const response = await server
        .post("/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({
          activityId: otherActivity.id,
        });
              
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 200 with a valid body", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
  
      const locale = await createLocale("local test");      
      const activity = await createActivity(activityParams, locale);
    
      createValidBody();
      const response = await server.post("/applications").set("Authorization", `Bearer ${token}`).send({
        activityId: activity.id,
      });
    
      expect(response.status).toEqual(httpStatus.OK);
    });
  });
});

describe("DELETE /applications/:activityId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.delete("/applications/1");
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
      
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
      
    const response = await server.delete("/applications/1").set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
      
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
      
    const response = await server.delete("/applications/1").set("Authorization", `Bearer ${token}`);
      
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
      
      const response = await server.delete("/applications/1").set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });
    
    it("should respond with status 401 when user has no payment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      
      const response = await server.delete("/applications/1").set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });
    
    it("should respond with status 401 with invalid activity id", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
  
      const locale = await createLocale("local test");
      const activity = await createActivity(activityParams, locale);
      const application = await createApplication(activity.id, user);
        
      const response = await server.delete(`/applications/${application.id +1}`).set("Authorization", `Bearer ${token}`);
        
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });
      
    it("should delete application and respond with status 200", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
    
      const locale = await createLocale("local test");
      const activity = await createActivity(activityParams, locale);
      await createApplication(activity.id, user);
      
      const response = await server.delete(`/applications/${activity.id}`).set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toEqual(httpStatus.OK);
    });
  });
});
  
