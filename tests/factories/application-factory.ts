import { prisma } from "@/config";

type CreateApplicationParams = {
  activityId: number;
  userId: number;
};

export function createApplication({ activityId, userId }: CreateApplicationParams) {
  return prisma.userActivity.create({
    data: {
      activityId,
      userId,
    },
  });
}
