import { unauthorizedError, notFoundError } from "@/errors";
import { formatDate, formatTime } from "@/utils/formatDate";
import activityRepository from "@/repositories/activity-repository";
import applicationRepository from "@/repositories/application-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import tikectRepository from "@/repositories/ticket-repository";

async function checkEnrollmentTicket(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw unauthorizedError();
  }
  const ticket = await tikectRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote) {
    throw unauthorizedError();
  }
}

async function checkValidApplication(activityId: number, userId: number) {
  const activity = await activityRepository.findById(activityId);  
  if (!activity) {
    throw notFoundError();
  }

  const date = formatDate(activity.date);
  const startTime = formatTime(activity.startTime);
 
  const applications = await getApplications(userId);
  
  const unavailability = applications
    .filter( application => 
      application.date === date && application.startTime === startTime
    );
  
  if (unavailability.length > 0) {
    throw unauthorizedError();
  }

  const countApplications = await applicationRepository.countByActivityId(activityId);
 
  if(countApplications === activity.capacity) {
    throw unauthorizedError();
  }
}

async function getApplications(userId: number) {
  await checkEnrollmentTicket(userId);

  const applicationsResult = await applicationRepository.findByUserId(userId);
  if (!applicationsResult) {
    throw notFoundError();
  }

  const applications = applicationsResult.map((a) => {
    return {
      id: a.id,
      activityId: a.activityId,
      capacity: a.Activity.capacity,
      date: formatDate(a.Activity.date),
      startTime: formatTime(a.Activity.startTime)
    };
  });
  
  return applications;
}

async function postApplicationById(userId: number, activityId: number) {
  await checkEnrollmentTicket(userId);
  await checkValidApplication(activityId, userId);

  return applicationRepository.create({ activityId, userId });
}
  
const applicationsService = {
  getApplications,
  postApplicationById,
};
  
export default applicationsService;
