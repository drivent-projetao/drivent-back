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

const activityRepository = {
  findManyActivities,
};

export default activityRepository;
