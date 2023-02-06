import app, { init }  from "@/app";
import { cleanDb } from "../helpers";
import { generateValidToken } from "../helpers";
import httpStatus from "http-status";
import supertest from "supertest";
import { prisma } from "@/config";

beforeEach(async () => {
    await init();
    await cleanDb();
});

afterEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe("Hotels testing", () => {
    it("Test /GET hotels status if no token:", async () => {
        const resultado = await server.get("/hotels");
        expect(resultado.status).toEqual(httpStatus.UNAUTHORIZED);
    });
    it("Test /GET hotels status if invalid token:", async () => {
        const resultado = await server.get("/hotels").set("Authorization", "Bearer XXXXXXXXXXXXXXXX");
        expect(resultado.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("Test /GET hotels status if valid token but no Enrollments, Tickets, isRemote true, includesHotel false:", async () => {
        const randomNumber = Math.floor(Math.random() * 100000000);
        const user = await prisma.user.create({
            data: {
                email: `teste${randomNumber}@teste.com`,
                password: "banana123"
            }
        });
        const token = generateValidToken(user);
        await prisma.session.create({
            data: {
                token: String(token),
                userId: user.id
            }
        });
        const resultado = await server.get("/hotels").set("Authorization", `Bearer ${token}` );
        expect(resultado.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("Test /GET hotels status if valid token but only enrollments", async () => {
        const randomNumber = Math.floor(Math.random() * 100000000);
        const user = await prisma.user.create({
            data: {
                email: `teste${randomNumber}@teste.com`,
                password: "banana123"
            }
        });

        const sessions = await prisma.session.create({
            data: {
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY3NTQzNjE5Nn0.4EiVajszrSUsP2-7h52n0gBwEzp_hyfvrUxUv_uJqJY",
                userId: user.id
            }
        });

        const enrollment = await prisma.enrollment.create({
            data: {
                name: "evento teste",
                birthday: "1997-07-16T19:20:30.451Z",
                cpf: "06185700980",
                phone: "554830246004",
                userId: user.id
            }
        });

        const resultado = await server.get("/hotels").set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY3NTQzNjE5Nn0.4EiVajszrSUsP2-7h52n0gBwEzp_hyfvrUxUv_uJqJY");
        expect(resultado.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("Test /GET hotels status if valid token but only ticket was purchased but payed", async () => {
        const randomNumber = Math.floor(Math.random() * 100000000);
        const user = await prisma.user.create({
            data: {
                email: `teste${randomNumber}@teste.com`,
                password: "banana123"
            }
        });
        const token = await generateValidToken(user);

        const sessions = await prisma.session.create({
            data: {
                token: String(token),
                userId: user.id
            }
        });

        const enrollment = await prisma.enrollment.create({
            data: {
                name: "evento teste",
                birthday: "1997-07-16T19:20:30.451Z",
                cpf: "06185700980",
                phone: "554830246004",
                userId: user.id
            }
        });

        const ticketType = await prisma.ticketType.create({
            data: {
                name: "evento",
                price: 50000,
                includesHotel: true,
                isRemote: false
            }
        });

        const ticket = await prisma.ticket.create({
            data:{
                status: "PAID",
                enrollmentId: enrollment.id,
                ticketTypeId: ticketType.id
            }
        });
        
        const resultado = await server.get("/hotels").set("Authorization", `Bearer ${token}` );
        expect(resultado.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("Test /GET hotels status if valid token but ticket was remote", async () => {
        const randomNumber = Math.floor(Math.random() * 100000000);
        const user = await prisma.user.create({
            data: {
                email: `teste${randomNumber}@teste.com`,
                password: "banana123"
            }
        });
        const token = await generateValidToken(user);
        await prisma.session.create({
            data: {
                token: String(token),
                userId: user.id
            }
        });

        const enrollment = await prisma.enrollment.create({
            data: {
                name: "evento teste",
                birthday: "1997-07-16T19:20:30.451Z",
                cpf: "06185700980",
                phone: "554830246004",
                userId: user.id
            }
        });

        const ticketType = await prisma.ticketType.create({
            data: {
                name: "evento",
                price: 50000,
                includesHotel: false,
                isRemote: true
            }
        });

        const ticket = await prisma.ticket.create({
            data: {
                status: "PAID",
                enrollmentId: enrollment.id,
                ticketTypeId: ticketType.id
            }
        });
        
        const resultado = await server.get("/hotels").set("Authorization", `Bearer ${token}` );
        expect(resultado.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("Test /GET hotels status if valid token but ticket wasnt paid", async () => {
        const randomNumber = Math.floor(Math.random() * 100000000);
        const user = await prisma.user.create({
            data: {
                email: `teste${randomNumber}@teste.com`,
                password: "banana123"
            }
        });
        const token = await generateValidToken(user);
        await prisma.session.create({
            data: {
                token: String(token),
                userId: user.id
            }
        });

        const enrollment = await prisma.enrollment.create({
            data: {
                name: "evento teste",
                birthday: new Date(),
                cpf: "06185700980",
                phone: "554830246004",
                userId: user.id
            }
        });

        const ticketType = await prisma.ticketType.create({
            data: {
                name: "evento",
                price: 50000,
                includesHotel: true,
                isRemote: false
            }
        });

        await prisma.ticket.create({
            data: {
                status: "PAID",
                enrollmentId: enrollment.id,
                ticketTypeId: ticketType.id
            }
        });
        
        const resultado = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        expect(resultado.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("Test /GET hotels object with everything right:", async () => {
        const randomNumber = Math.floor(Math.random() * 100000000);
        const user = await prisma.user.create({
            data: {
                email: `teste${randomNumber}@teste.com`,
                password: "banana123"
            }
        });
        const token = await generateValidToken(user);
        await prisma.session.create({
            data: {
                token: String(token),
                userId: user.id
            }
        });

        const enrollment = await prisma.enrollment.create({
            data: {
                name: "evento teste",
                birthday: new Date(),
                cpf: "06185700980",
                phone: "554830246004",
                userId: user.id
            }
        });

        await prisma.address.create({
            data: {
                cep: "88036000",
                city: "Florianopolis",
                neighborhood: "Trindade",
                number: "102394",
                state: "SC",
                street: "Lauro Linhares",
                enrollmentId: enrollment.id,
                addressDetail: "nothing"
            }
        });

        const ticketType = await prisma.ticketType.create({
            data: {
                name: "evento",
                price: 50000,
                includesHotel: true,
                isRemote: false
            }
        });

        const ticket = await prisma.ticket.create({
            data: {
                status: "RESERVED",
                enrollmentId: enrollment.id,
                ticketTypeId: ticketType.id
            }
        });

        await prisma.payment.create({
            data: {
                cardIssuer: "VISA",
                cardLastDigits: "3456",
                value: ticketType.price,
                ticketId: ticket.id
            }
        });

        await prisma.hotel.createMany({
            data: [
                {
                    image: "https://blog.websocorro.com.br/wp-content/uploads/2021/01/banner1-750x350.jpg",
                    name: "hotel bacana 1"
                },
                {
                    image: "https://www.cuiket.com.br/imagenes/company_photo/213_big.jpg",
                    name: "hotel bacana 2"
                }
            ]
        });
        
        const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        expect(result.status).toEqual(httpStatus.OK);
        expect(result.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    image: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                }),
            ]),
        );
    });

    it("Testing GET /hotels/:id route body", async () => {
        const randomNumber = Math.floor(Math.random() * 100000000);
        const user = await prisma.user.create({
            data: {
                email: `teste${randomNumber}@teste.com`,
                password: "banana123"
            }
        });
        const token = await generateValidToken(user);
        await prisma.session.create({
            data: {
                token: String(token),
                userId: user.id
            }
        });

        const enrollment = await prisma.enrollment.create({
            data: {
                name: "evento teste",
                birthday: new Date(),
                cpf: "06185700980",
                phone: "554830246004",
                userId: user.id
            }
        });

        await prisma.address.create({
            data: {
                cep: "88036000",
                city: "Florianopolis",
                neighborhood: "Trindade",
                number: "102394",
                state: "SC",
                street: "Lauro Linhares",
                enrollmentId: enrollment.id,
                addressDetail: "nothing"
            }
        });

        const ticketType = await prisma.ticketType.create({
            data: {
                name: "evento",
                price: 50000,
                includesHotel: true,
                isRemote: false
            }
        });

        const ticket = await prisma.ticket.create({
            data: {
                status: "RESERVED",
                enrollmentId: enrollment.id,
                ticketTypeId: ticketType.id
            }
        });

        await prisma.payment.create({
            data: {
                cardIssuer: "VISA",
                cardLastDigits: "3456",
                value: ticketType.price,
                ticketId: ticket.id
            }
        });

        const hotel = await prisma.hotel.create({
            data: 
                {
                    image: "https://blog.websocorro.com.br/wp-content/uploads/2021/01/banner1-750x350.jpg",
                    name: "hotel bacana 1"
                }
        });

        const room = await prisma.room.create({
            data: {
                capacity: 5,
                name: "Test room",
                hotelId: hotel.id
            }
        });

        await prisma.booking.create({
            data: {
                roomId: room.id,
                userId: user.id
            }
        });
        const result = await server.get(`/hotel/${hotel.id}`).set("Authorization", `Bearer ${token}`);
        expect(result.body).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String), 
                image: expect.any(String),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date || null),
                Rooms: expect.arrayContaining(
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        capacity: expect.any(Number),
                        hotelId: expect.any(Number),
                        createdAt: expect.any(Date),
                        updatedAt: expect.any(String || null),
                    })
                )
            }));
        expect(result.status).toBe(httpStatus.OK);
    });

    it("Testing GET /hotels/:id route body", async () => {
        const randomNumber = Math.floor(Math.random() * 100000000);
        const user = await prisma.user.create({
            data: {
                email: `teste${randomNumber}@teste.com`,
                password: "banana123"
            }
        });
        const token = await generateValidToken(user);
        await prisma.session.create({
            data: {
                token: String(token),
                userId: user.id
            }
        });

        const enrollment = await prisma.enrollment.create({
            data: {
                name: "evento teste",
                birthday: new Date(),
                cpf: "06185700980",
                phone: "554830246004",
                userId: user.id
            }
        });

        await prisma.address.create({
            data: {
                cep: "88036000",
                city: "Florianopolis",
                neighborhood: "Trindade",
                number: "102394",
                state: "SC",
                street: "Lauro Linhares",
                enrollmentId: enrollment.id,
                addressDetail: "nothing"
            }
        });

        const ticketType = await prisma.ticketType.create({
            data: {
                name: "evento",
                price: 50000,
                includesHotel: true,
                isRemote: false
            }
        });

        const ticket = await prisma.ticket.create({
            data: {
                status: "RESERVED",
                enrollmentId: enrollment.id,
                ticketTypeId: ticketType.id
            }
        });

        await prisma.payment.create({
            data: {
                cardIssuer: "VISA",
                cardLastDigits: "3456",
                value: ticketType.price,
                ticketId: ticket.id
            }
        });

        const hotel = await prisma.hotel.create({
            data: 
                {
                    image: "https://blog.websocorro.com.br/wp-content/uploads/2021/01/banner1-750x350.jpg",
                    name: "hotel bacana 1"
                }
        });

        const room = await prisma.room.create({
            data: {
                capacity: 5,
                name: "Test room",
                hotelId: hotel.id
            }
        });

        await prisma.booking.create({
            data: {
                roomId: room.id,
                userId: user.id
            }
        });
        const result = await server.get("/hotels/10000000000000").set("Authorization", `Bearer ${token}`);
        expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });
});
