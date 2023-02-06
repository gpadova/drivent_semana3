import { NextFunction, Request, Response } from "express";
import { prisma } from "@/config";
import { notFoundError } from "@/errors";

export async function verifyIfHotelExists(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    
    const hotelExists = await prisma.hotel.findUnique({
        where: {
            id: Number(id)
        }
    });
    
    if(!hotelExists) throw notFoundError;

    next();
}
