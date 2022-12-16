import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function createUser() {
  let testUser = await prisma.user.findFirst({
    where: {
      email: 'teste@gmail.com',
    },
  });
  if (!testUser) {
    const hashedPassword = await bcrypt.hash('123456', 12);
    const testUser = await prisma.user.create({
      data: {
        email: 'teste@gmail.com',
        password: hashedPassword,
      },
    });
  }
  console.log({ testUser });
}

async function createHotels() {
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

async function main() {
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

  await createUser();
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
