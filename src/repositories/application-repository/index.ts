import { prisma } from "@/config";
import { UserActivity } from "@prisma/client";

type CreateParams = Omit<UserActivity, "id" | "createdAt" | "updatedAt">;

async function create({ activityId, userId }: CreateParams) {
  return prisma.userActivity.create({
    data: {
      activityId,
      userId
    }
  });
}

async function findByActivityId({ activityId, userId }: CreateParams)  {
  return prisma.userActivity.findFirst({
    where: {
      activityId,
      userId
    }
  });
}

async function findByUserId(userId: number) {
  return prisma.userActivity.findMany({
    where: { 
      userId 
    },
    include: {
      Activity: true
    }
  });
}

async function countByActivityId(activityId: number) {
  return prisma.userActivity.count({
    where: { 
      activityId
    }
  });
}

async function deleteById(id: number) {
  return prisma.userActivity.delete({
    where: {
      id
    }
  });
}

const applicationRepository = {
  findByUserId, findByActivityId, create, countByActivityId, deleteById
};

export default applicationRepository;
