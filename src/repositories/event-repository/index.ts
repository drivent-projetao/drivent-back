import { prisma } from "@/config";
import { redisClient } from "@/app";

async function findFirst() {
  const event = await redisClient.get("event");
  let eventDb = {};

  if(!event) {
    eventDb = await prisma.event.findFirst();
    await redisClient.set("event", JSON.stringify(event));
    return eventDb;
  }

  return JSON.parse(event);
}

const eventRepository = {
  findFirst,
};

export default eventRepository;
