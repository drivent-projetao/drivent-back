import { Local, Activity } from "@prisma/client";
import { prisma } from "@/config";
import faker from "@faker-js/faker";

export function createActivity(params: Partial<Activity> = {}, locale: Partial<Local> = {}): Promise<Activity> {
  return prisma.activity.create({
    data: {
      name: params.name || faker.lorem.sentence(),
      capacity:
        params.capacity ||
        faker.datatype.number({
          min: 1,
          max: 3,
        }),
      localId: locale.id,
      date: params.date || faker.date.between("2020-01-01T00:00:00.000Z", "2030-01-01T00:00:00.000Z"),
      startTime: params.startTime || faker.date.between("2020-01-01T00:00:00.000Z", "2030-01-01T00:00:00.000Z"),
      endTime: params.endTime || faker.date.between("2020-01-01T00:00:00.000Z", "2030-01-01T00:00:00.000Z"),
    },
  });
}

export function createUserInActivity(activityId: number, userId: number) {
  return prisma.userActivity.create({
    data: {
      activityId,
      userId
    }
  });
}
