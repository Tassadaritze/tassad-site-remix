import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import { createInstance } from "i18next";
import Backend from "i18next-fs-backend";
import { resolve } from "node:path";
import { initReactI18next } from "react-i18next";

import i18next from "./i18next.server";
import i18n from "./i18n";

export default async function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext
) {
    const instance = createInstance();

    const lng = await i18next.getLocale(request);
    const ns = i18next.getRouteNamespaces(remixContext);

    await instance
        .use(initReactI18next)
        .use(Backend)
        .init({
            ...i18n,
            lng,
            ns,
            backend: {
                loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json")
            }
        });

    const markup = renderToString(<RemixServer context={remixContext} url={request.url} />);

    responseHeaders.set("Content-Type", "text/html");

    return new Response("<!DOCTYPE html>" + markup, {
        status: responseStatusCode,
        headers: responseHeaders
    });
}
