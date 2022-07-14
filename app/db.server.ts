import { PrismaClient } from "@prisma/client";
import type { Message } from "@prisma/client";

const MESSAGE_LIMIT = 100;

let prisma: PrismaClient;

declare global {
    var __db__: PrismaClient;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient();

    __db__.$use(async (params, next) => {
        if (params.action === "create" && params.model === "Message") {
            const result = (await next(params)) as Message;
            const messageCount = await __db__.message.count();
            if (messageCount > MESSAGE_LIMIT) {
                await __db__.message.deleteMany({
                    where: {
                        id: {
                            lte: result.id - MESSAGE_LIMIT
                        }
                    }
                });
            }
            return result;
        } else {
            return next(params);
        }
    });
} else {
    if (!global.__db__) {
        global.__db__ = new PrismaClient();
    }
    prisma = global.__db__;
    prisma.$connect().catch(console.error);
}

export { prisma };
