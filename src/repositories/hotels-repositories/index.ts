import { prisma } from "@/config";

async function getHotelsRepository() {
    return prisma.hotel.findMany();
}

async function findEnrollmentQuery(userId: number) {
    return await prisma.enrollment.findFirst({
        where: {
            userId
        }
    });
}

async function verifyTicketIdQuery(enrollmentId: number) {
    return prisma.ticket.findFirst({
        where: {
            enrollmentId 
        }
    });
}

async function verifyPaymentIdQuery(ticketId: number) {
    return prisma.payment.findFirst({
        where: {
            ticketId 
        }
    });
}

async function verifyTicketIdType(ticketTypeId: number) {
    return prisma.ticketType.findFirst({
        where: {
            id: ticketTypeId
        }
    });
}

async function getHotelsWithId(id: string) {
    return prisma.hotel.findUnique({
        where: { 
            id: Number(id) },
        include: {
            Rooms: true,
        },
    });
}

async function verifyHotelId(id:string) {
    return prisma.hotel.findFirst({
        where: {
            id: Number(id)
        }
    });
}

const hotelRepository = {
    getHotelsRepository,
    findEnrollmentQuery,
    verifyTicketIdQuery,
    verifyPaymentIdQuery,
    verifyTicketIdType,
    getHotelsWithId,
    verifyHotelId
};

export default hotelRepository;
