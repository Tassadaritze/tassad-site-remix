import { createSessionStorage } from "@remix-run/node";
import invariant from "tiny-invariant";

import { prisma } from "~/db.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

// eslint-disable-next-line @typescript-eslint/unbound-method
export const { getSession, commitSession, destroySession } = createSessionStorage({
    cookie: {
        name: "__session",
        httpOnly: true,
        maxAge: 2_629_800,
        path: "/",
        sameSite: "lax",
        secrets: [process.env.SESSION_SECRET],
        secure: process.env.NODE_ENV === "production"
    },
    createData: async (data, expires) => {
        const entry = await prisma.user.create({
            data: {
                session: data,
                expires
            }
        });
        return entry.id;
    },
    readData: async (id) => {
        const entry = await prisma.user.findUnique({
            where: {
                id
            }
        });
        if (entry?.session && typeof entry.session === "object") {
            return entry.session;
        }
        return null;
    },
    updateData: async (id, data, expires) => {
        await prisma.user.update({
            where: {
                id
            },
            data: {
                session: data,
                expires
            }
        });
    },
    deleteData: async (id) => {
        await prisma.user.delete({
            where: {
                id
            }
        });
    }
});

export const isUsernameAvailable = async (username: string): Promise<boolean> => {
    const entry = await prisma.user.findFirst({
        where: {
            session: {
                path: ["username"],
                equals: username
            }
        }
    });
    return entry === null;
};
