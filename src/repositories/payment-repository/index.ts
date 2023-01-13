import { prisma } from "@/config";
import { Payment } from "@prisma/client";
import { Ticket, TicketStatus } from "@prisma/client";

async function findPaymentByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: {
      ticketId,
    }
  });
}

async function processPayment(ticketId: number, params: PaymentParams) {
  const payment = await prisma.$transaction([
    prisma.payment.create({
      data: {
        ticketId,
        ...params,
      }
    }),
    prisma.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        status: TicketStatus.PAID,
      }
    })
  ]);
  return payment;
}

export type PaymentParams = Omit<Payment, "id" | "createdAt" | "updatedAt">

const paymentRepository = {
  findPaymentByTicketId,
  processPayment
};

export default paymentRepository;
