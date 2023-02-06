import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotels, getHotelById } from "@/controllers/hotels-controllers";
import { verifyIfHotelExists } from "@/middlewares";

const hotelsRouter = Router();

hotelsRouter.get("", authenticateToken, getHotels);
hotelsRouter.get("/:id", authenticateToken, verifyIfHotelExists, getHotelById);

export { hotelsRouter };
