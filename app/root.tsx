import { json } from "@remix-run/node";
import type { LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { useChangeLanguage } from "remix-i18next";
import { useTranslation } from "react-i18next";

import i18next from "~/i18next.server";

import tailwindStylesheetUrl from "./styles/tailwind.css";

type LoaderData = { locale: string };

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
    charset: "utf-8",
    title: "tassad-site on Remix",
    viewport: "width=device-width,initial-scale=1"
});

export const loader: LoaderFunction = async ({ request }) => {
    const locale = await i18next.getLocale(request);
    return json<LoaderData>({ locale });
};

export const handle = {
    // In the handle export, we can add a i18n key with namespaces our route
    // will need to load. This key can be a single string or an array of strings.
    // TIP: In most cases, you should set this to your defaultNS from your i18n config
    // or if you did not set one, set it to the i18next default namespace "translation"
    i18n: "common"
};

const App = () => {
    // Get the locale from the loader
    const { locale } = useLoaderData<LoaderData>();

    const { i18n } = useTranslation();

    // This hook will change the i18n instance language to the current locale
    // detected by the loader, this way, when we do something to change the
    // language, this locale will change and i18next will load the correct
    // translation files
    useChangeLanguage(locale);

    return (
        <html lang={locale} dir={i18n.dir()} className="h-full">
            <head>
                <Meta />
                <Links />
            </head>
            <body className="h-fit">
                <header className={"flex h-16 min-w-full items-center justify-between bg-black text-4xl text-white"}>
                    <div className="flex gap-x-8 px-4">
                        <Link to="/" className="hover:text-blue-600 hover:underline">
                            Home
                        </Link>
                        <Link to="/chat" className="hover:text-blue-600 hover:underline">
                            Chat
                        </Link>
                        <p>Placeholder</p>
                    </div>
                    <div className="px-4">
                        <p>🌙</p>
                    </div>
                </header>
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
};

export default App;
