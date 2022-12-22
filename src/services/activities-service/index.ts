import activitiyRepository from "@/repositories/activity-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { Activity } from "@prisma/client";
import { formatDateWithWeekday, formatDate, formatTime } from "@/utils/formatDate";
import { unauthorizedError, notFoundError } from "@/errors";

type processedActivities = Omit<Activity, "localId" | "createdAt" | "updatedAt" | "date" | "startTime" | "endTime"> & {
  local: string;
  date: string;
  startTime: string;
  endTime: string;
};
type getActivitiesResult = { dates: string[]; activities: processedActivities[] };

async function getActivities(userId: number): Promise<getActivitiesResult> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw unauthorizedError();

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote) {
    throw unauthorizedError();
  }

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

async function getNumberOfUsersByActivityId(userId: number, activityId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw unauthorizedError();

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote) {
    throw unauthorizedError();
  }

  const result = (await activitiyRepository.findUsersByActivity(activityId)).length;
  if (result === null) {
    throw notFoundError();
  }
  return result;
}

const activitiesService = {
  getActivities,
  getNumberOfUsersByActivityId
};

export default activitiesService;
