import { prisma } from "~/db.server";

export type { Message } from "@prisma/client";

export const getMessages = async (take: number) => {
    return prisma.message.findMany({ take });
};

export const addMessage = async (message: string) => {
    return prisma.message.create({ data: { message } });
};
