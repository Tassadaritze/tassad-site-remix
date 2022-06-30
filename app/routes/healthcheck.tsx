// learn more: https://fly.io/docs/reference/configuration/#services-http_checks
import type { LoaderFunction } from "@remix-run/node";

import invariant from "tiny-invariant";

export const loader: LoaderFunction = ({ request }) => {
    const host = request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

    try {
        invariant(host);
        return new Response("OK");
    } catch (error: unknown) {
        console.log("healthcheck ❌", { error });
        return new Response("ERROR", { status: 500 });
    }
};
