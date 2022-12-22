import activitiyRepository from "@/repositories/activity-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { formatDateWithWeekday } from "@/utils/formatDate";
import { unauthorizedError, notFoundError } from "@/errors";

async function getActivitiesDates(userId: number): Promise<string[]> {
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

  const dates = activitiesResult.map((a) => formatDateWithWeekday(a.date));
  return dates;
}

const activitiesService = {
  getActivitiesDates,
};

export default activitiesService;
