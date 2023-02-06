import hotelRepository from "@/repositories/hotels-repositories";
import { notFoundError, paymentRequiredError } from "@/errors";

async function getHotelsServices(userId: number) {
    const verififyEnrollmentId = await hotelRepository.findEnrollmentQuery(userId);
    if (!verififyEnrollmentId) throw new Error("Enrollment Required");

    const enrollmentId = verififyEnrollmentId.id;
    const verifyTicket = await hotelRepository.verifyTicketIdQuery(enrollmentId);
    if (!verifyTicket) throw new Error("Ticket Required");

    const ticketId = verifyTicket.id;
    const verifyPaymentId = await hotelRepository.verifyPaymentIdQuery(ticketId);
    if (!verifyPaymentId) throw new Error("Payment Required");

    const { ticketTypeId }  = verifyTicket;
    const ticketType = await hotelRepository.verifyTicketIdType(ticketTypeId);
    if(ticketType.isRemote || !ticketType.includesHotel) throw new Error("Ticket not suitable");

    const response = await hotelRepository.getHotelsRepository();
    return response;
}

async function getHotelById(userId: number, id: string) {
    const verifyHotelInDb = await hotelRepository.verifyHotelId(id);
    if(!verifyHotelInDb) throw notFoundError;
    
    const verififyEnrollmentId = await hotelRepository.findEnrollmentQuery(userId);
    if (!verififyEnrollmentId) throw notFoundError;

    const enrollmentId = verififyEnrollmentId.id;
    const verifyTicketId = await hotelRepository.verifyTicketIdQuery(enrollmentId);
    if (!verifyTicketId) throw notFoundError;

    const ticketId = verifyTicketId.id;
    const verifyPaymentId = await hotelRepository.verifyPaymentIdQuery(ticketId);
    if (!verifyPaymentId) throw paymentRequiredError;

    const { ticketTypeId }  = verifyTicketId;
    const ticketType = await hotelRepository.verifyTicketIdType(ticketTypeId);
    if(ticketType.isRemote || !ticketType.includesHotel) throw paymentRequiredError;

    return hotelRepository.getHotelsWithId(id);
}

const hotelsService = {
    getHotelsServices,
    getHotelById
};

export default hotelsService;
