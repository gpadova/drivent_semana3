import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import hotelsService from "@/services/hotels-services";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import { JWTPayload } from "@/middlewares";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    const authHeader = req.header("Authorization");
    const token = authHeader.split(" ")[1];
    const { userId } = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    try {
        const hotels = await hotelsService.getHotelsServices(userId);
        return res.send(hotels).status(httpStatus.OK);
    } catch (error) {
        console.log(error);
        if(error.name === "PaymentRequiredError") {return res.sendStatus(httpStatus.PAYMENT_REQUIRED);}
        return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const authHeader = req.header("Authorization");
    const token = authHeader.split(" ")[1];
    const { userId } = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    try {
        const hotel = await hotelsService.getHotelById(userId, id);
        return res.status(httpStatus.OK).send(hotel);
    } catch (error) {
        if(error.name === "PaymentRequiredError") {return res.sendStatus(httpStatus.PAYMENT_REQUIRED);}
        return res.sendStatus(httpStatus.NOT_FOUND);
    }
}
