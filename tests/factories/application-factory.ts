import { prisma } from "@/config";
import { User } from "@prisma/client";
import { createUser } from "./users-factory";

export async function createApplication(activityId: number, user?: User) {
  const incomingUser = user || (await createUser());
  return prisma.userActivity.create({
    data: {
      activityId,
      userId: incomingUser.id,
    },
  });
}
