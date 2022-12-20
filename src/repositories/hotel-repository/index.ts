import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

async function findHotelsWithRoomInfo() {
  return prisma.hotel.findMany({
    include: {
      Rooms: {
        include: {
          _count: {
            select: { Booking: true },
          },
        },
      },
    },
  });
}

const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
  findHotelsWithRoomInfo,
};

export default hotelRepository;
