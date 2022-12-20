import { notFoundError } from "@/errors";
import activitiyRepository from "@/repositories/activity-repository";
import { Activity } from "@prisma/client";
import { formatDateWithWeekday, formatDate, formatTime } from "@/utils/formatDate";

type processedActivities = Omit<Activity, "localId" | "createdAt" | "updatedAt" | "date" | "startTime" | "endTime"> & {
  local: string;
  date: string;
  startTime: string;
  endTime: string;
};
type getActivitiesResult = { dates: string[]; activities: processedActivities[] };

async function getActivities(): Promise<getActivitiesResult> {
  const activitiesResult = await activitiyRepository.findManyActivities();
  if (!activitiesResult) {
    throw notFoundError();
  }

  const activities = activitiesResult.map((a) => {
    return {
      id: a.id,
      name: a.name,
      local: a.Local.name,
      capacity: a.capacity,
      date: formatDate(a.date),
      startTime: formatTime(a.startTime),
      endTime: formatTime(a.endTime),
    };
  });
  const dates = activitiesResult.map((a) => formatDateWithWeekday(a.date));

  return { dates, activities };
}

const activitiesService = {
  getActivities,
};

export default activitiesService;
