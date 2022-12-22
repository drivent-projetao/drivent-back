import { cannotBookingError, notFoundError } from "@/errors";
import activityRepository from "@/repositories/activity-repository";
import applicationRepository from "@/repositories/application-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import tikectRepository from "@/repositories/ticket-repository";

async function checkEnrollmentTicket(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw cannotBookingError();
  }
  const ticket = await tikectRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote) {
    throw cannotBookingError();
  }
}

async function checkValidApplication(activityId: number, userId: number) {
  const activity = await activityRepository.findById(activityId);  
  if (!activity) {
    throw notFoundError();
  }
  const date = activity.date;
  const startTime = activity.startTime;

  const applications = await getApplications(userId);
  const unavailability = applications
    .filter((application) => 
      application.date === date && application.startTime == startTime
    );
  if (unavailability) {
    throw cannotBookingError();
  }

  const countApplications = await applicationRepository.countByActivityId(activityId);
  if(countApplications === activity.capacity) {
    throw cannotBookingError();
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
      date: a.Activity.date,
      startTime: a.Activity.startTime
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
