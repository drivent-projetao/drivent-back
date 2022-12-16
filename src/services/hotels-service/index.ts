import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import { Hotel, Room } from "@prisma/client";

async function listHotels(userId: number) {
  //Tem enrollment?
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  //Tem ticket pago isOnline false e includesHotel true
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotListHotelsError();
  }
}

async function getHotels(userId: number) {
  await listHotels(userId);

  const hotels = await hotelRepository.findHotels();
  return hotels;
}

async function getHotelsWithRooms(userId: number, hotelId: number) {
  await listHotels(userId);
  const hotel = await hotelRepository.findRoomsByHotelId(hotelId);

  if (!hotel) {
    throw notFoundError();
  }
  return hotel;
}

type RoomInfo = Omit<Room, "createdAt" | "updatedAt"> & { bookingCount: number };
type hotelWithRoomInfo = Omit<Hotel, "createdAt" | "updatedAt"> & { rooms: RoomInfo[] };
async function getHotelsWithRoomInfo(userId: number): Promise<hotelWithRoomInfo[]> {
  await listHotels(userId);
  const hotelsWithRoomInfo = await hotelRepository.findHotelsWithRoomInfo();
  const hotels = hotelsWithRoomInfo.map((hotel) => {
    return {
      id: hotel.id,
      name: hotel.name,
      image: hotel.image,
      rooms: hotel.Rooms.map((room) => {
        return {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          bookingCount: room._count.Booking,
        };
      }),
    };
  });
  return hotels;
}

const hotelService = {
  getHotels,
  getHotelsWithRooms,
  getHotelsWithRoomInfo,
};

export default hotelService;
