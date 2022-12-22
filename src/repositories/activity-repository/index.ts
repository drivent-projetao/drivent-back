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

async function findById(id: number) {
  return prisma.activity.findUnique({
    where: {
      id
    }
  });
}

const activityRepository = {
  findManyActivities,
  findById,
};

export default activityRepository;
