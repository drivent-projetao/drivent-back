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

async function findLocationsWithActivities(date: Date) {
  return prisma.local.findMany({
    include: {
      Activity: {
        where: {
          date
        }
      }
    },
    orderBy: {
      name: "asc"
    },
  });
}

const activityRepository = {
  findManyActivities,
  findById,
  findLocationsWithActivities
};

export default activityRepository;
