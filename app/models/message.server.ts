import { prisma } from "~/db.server";

export type { Message } from "@prisma/client";

export const getMessages = async () => {
    return prisma.message.findMany({ take: -100 });
};

export const addMessage = async (message: string) => {
    return prisma.message.create({ data: { message } });
};
