import type { Event } from "~/chat.server";
import { prisma } from "~/db.server";

export const getMessages = () => {
    return prisma.message.findMany({
        select: {
            username: true,
            content: true,
            createdAt: true,
            type: true
        },
        orderBy: {
            id: "asc"
        }
    });
};

export const createMessage = (username: string, type: Event, content?: string) => {
    return prisma.message.create({
        data: {
            username,
            content,
            type
        }
    });
};
