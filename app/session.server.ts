import { createCookieSessionStorage } from "@remix-run/node";
import invariant from "tiny-invariant";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

// eslint-disable-next-line @typescript-eslint/unbound-method
export const { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
        name: "__session",
        httpOnly: true,
        maxAge: 0,
        path: "/",
        sameSite: "lax",
        secrets: [process.env.SESSION_SECRET],
        secure: process.env.NODE_ENV === "production"
    }
});
