import { prisma } from "@/config";
import { unauthorizedError } from "@/errors";
import { UserActivity } from "@prisma/client";

type CreateParams = Omit<UserActivity, "id" | "createdAt" | "updatedAt">;

async function create(activityId: number, userId: number, capacity: number) {
  const createApplication = await prisma.$transaction(async (prisma) => {
    const count = await prisma.userActivity.count({
      where: {
        activityId,
      },
    });

    if (count === capacity) throw unauthorizedError();

    return await prisma.userActivity.create({
      data: {
        activityId,
        userId,
      },
    });
  });
  return createApplication;
}

async function findByActivityId({ activityId, userId }: CreateParams) {
  return prisma.userActivity.findFirst({
    where: {
      activityId,
      userId,
    },
  });
}

async function findByUserId(userId: number) {
  return prisma.userActivity.findMany({
    where: {
      userId,
    },
    include: {
      Activity: true,
    },
  });
}

async function countByActivityId(activityId: number) {
  return prisma.userActivity.count({
    where: {
      activityId,
    },
  });
}

async function deleteById(id: number) {
  return prisma.userActivity.delete({
    where: {
      id,
    },
  });
}

const applicationRepository = {
  findByUserId,
  findByActivityId,
  create,
  countByActivityId,
  deleteById,
};

export default applicationRepository;
