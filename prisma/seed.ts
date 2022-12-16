import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';
import faker from '@faker-js/faker';
import { generateCPF, getStates } from '@brazilian-utils/brazilian-utils';
import { User, Enrollment, TicketType, Ticket, TicketStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function createEvent() {
  let event = await prisma.event.findFirst();
  if (!event) {
    event = await prisma.event.create({
      data: {
        title: 'Driven.t',
        logoImageUrl: 'https://files.driveneducation.com.br/images/logo-rounded.png',
        backgroundImageUrl: 'linear-gradient(to right, #FA4098, #FFD77F)',
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(21, 'days').toDate(),
      },
    });
  }
  console.log({ event });
}

async function createUser(): Promise<User> {
  let testUser = await prisma.user.findFirst({
    where: {
      email: 'teste@gmail.com',
    },
  });
  if (!testUser) {
    const hashedPassword = await bcrypt.hash('123456', 12);
    testUser = await prisma.user.create({
      data: {
        email: 'teste@gmail.com',
        password: hashedPassword,
      },
    });
  }
  console.log({ testUser });
  return testUser;
}

async function createEnrollmentWithAddress(user: User): Promise<Enrollment> {
  let enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
    },
  });
  if (!enrollment) {
    enrollment = await prisma.enrollment.create({
      data: {
        name: 'Teste',
        cpf: generateCPF(),
        birthday: faker.date.past(),
        phone: faker.phone.phoneNumber('(##) 9####-####'),
        userId: user.id,
      },
    });
    const address = await prisma.address.create({
      data: {
        street: faker.address.streetName(),
        cep: faker.address.zipCode(),
        city: faker.address.city(),
        neighborhood: faker.address.city(),
        number: faker.datatype.number().toString(),
        state: faker.helpers.arrayElement(getStates()).name,
        enrollmentId: enrollment.id,
      },
    });
  }
  console.log({ enrollment });
  return enrollment;
}

async function createTicketTypes(): Promise<TicketType[]> {
  let ticketTypes = await prisma.ticketType.findMany();
  if (ticketTypes.length === 0) {
    await prisma.ticketType.create({
      data: {
        name: 'Presencial',
        price: 250,
        isRemote: false,
        includesHotel: true,
      },
    });
    await prisma.ticketType.create({
      data: {
        name: 'Online',
        price: 100,
        isRemote: true,
        includesHotel: false,
      },
    });
    ticketTypes = await prisma.ticketType.findMany();
  }
  return ticketTypes;
}

async function createTicket(enrollment: Enrollment, ticketType: TicketType): Promise<Ticket> {
  let ticket = await prisma.ticket.findFirst({
    where: {
      ticketTypeId: ticketType.id,
      enrollmentId: enrollment.id,
    },
  });
  if (!ticket) {
    ticket = await prisma.ticket.create({
      data: {
        ticketTypeId: ticketType.id,
        enrollmentId: enrollment.id,
        status: TicketStatus.RESERVED,
      },
    });
  }
  console.log({ ticket });
  return ticket;
}

async function createPayment(ticket: Ticket) {
  let payment = await prisma.payment.findFirst({
    where: {
      ticketId: ticket.id,
    },
  });
  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        ticketId: ticket.id,
        value: 100,
        cardIssuer: faker.name.findName(),
        cardLastDigits: faker.datatype.number({ min: 1000, max: 9999 }).toString(),
      },
    });
    await prisma.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        status: TicketStatus.PAID,
      },
    });
  }
  console.log({ payment });
}

async function createHotels() {
  const hotels = await prisma.hotel.findMany();
  if (hotels.length === 0) {
    await prisma.hotel.create({
      data: {
        name: 'Driven Resort',
        image: 'https://strapi-taua.s3.sa-east-1.amazonaws.com/medium_principal_a92281080b_80b34f8d4b.jpeg',
      },
    });
    await prisma.hotel.create({
      data: {
        name: 'Driven Palace',
        image: 'https://worldtraveller73.files.wordpress.com/2020/07/dsc_0364.jpg-1.jpeg?w=1280&h=848&crop=1',
      },
    });
    await prisma.hotel.create({
      data: {
        name: 'Driven World',
        image: 'https://cdn.thomascook.com/optimized3/13281/4/image_1c7c4303bed6404fb1dfe0a686e8613a.webp',
      },
    });
  }
}

async function main() {
  await createEvent();
  const user = await createUser();
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketTypes = await createTicketTypes();
  const ticket = await createTicket(enrollment, ticketTypes[0]);
  await createPayment(ticket);
  await createHotels();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
