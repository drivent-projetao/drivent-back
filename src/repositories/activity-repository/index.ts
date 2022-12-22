import { prisma } from "@/config";

async function findManyActivities() {
  return prisma.activity.findMany({
    include: {
      Local: true,
    },
    orderBy: {
      date: "asc",
    },
  });
}

async function findUsersByActivity(activityId: number) {
  return prisma.userActivity.findMany({
    where: { activityId },
  });
}

const activityRepository = {
  findManyActivities,
  findUsersByActivity,
};

export default activityRepository;
