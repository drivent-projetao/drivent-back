import { unauthorizedError, notFoundError, requestError } from "@/errors";
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
  const endTime = formatTime(activity.endTime);

  const applications = await getApplications(userId);

  if (applications) {
    const unavailability = applications.filter(
      (application) =>
        application.date === date && (application.startTime === startTime || application.endTime === endTime),
    );

    if (unavailability.length > 0) {
      throw unauthorizedError();
    }
  }

  const countApplications = await applicationRepository.countByActivityId(activityId);

  if (countApplications === activity.capacity) {
    throw unauthorizedError();
  }
}

async function getApplications(userId: number) {
  await checkEnrollmentTicket(userId);

  const applicationsResult = await applicationRepository.findByUserId(userId);

  const applications = applicationsResult.map((a) => {
    return {
      id: a.id,
      activityId: a.activityId,
      capacity: a.Activity.capacity,
      date: formatDate(a.Activity.date),
      startTime: formatTime(a.Activity.startTime),
      endTime: formatTime(a.Activity.endTime),
    };
  });

  return applications;
}

async function findApplicationByActivityId(userId: number, activityId: number) {
  await checkEnrollmentTicket(userId);

  const application = await applicationRepository.findByActivityId({ activityId, userId });

  if (!application) {
    throw requestError(400, "bad request");
  }

  return application;
}

async function postApplicationById(userId: number, activityId: number) {
  await checkEnrollmentTicket(userId);
  await checkValidApplication(activityId, userId);
  const activity = await activityRepository.findById(activityId);

  return await applicationRepository.create(activityId, userId, activity.capacity);
}

async function deleteApplication(userId: number, activityId: number) {
  await checkEnrollmentTicket(userId);

  const application = await applicationRepository.findByActivityId({ activityId, userId });

  if (!application) {
    throw unauthorizedError();
  }

  await applicationRepository.deleteById(application.id);

  return;
}

const applicationsService = {
  getApplications,
  findApplicationByActivityId,
  postApplicationById,
  deleteApplication,
};

export default applicationsService;
