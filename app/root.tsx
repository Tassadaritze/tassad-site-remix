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
    i18n: "common"
};

const App = () => {
    const { locale } = useLoaderData<LoaderData>();

    const { i18n } = useTranslation();

    useChangeLanguage(locale);

    return (
        <html lang={locale} dir={i18n.dir()} className="h-full">
            <head>
                <Meta />
                <Links />
            </head>
            <body className="h-fit">
                <header className="flex h-16 min-w-full items-center justify-between bg-gray-800 text-4xl text-white">
                    <div className="flex gap-x-8 px-4">
                        <Link to="/" className="hover:text-blue-600 hover:underline">
                            Home
                        </Link>
                        <Link to="/chat" className="hover:text-blue-600 hover:underline">
                            Chat
                        </Link>
                        <p>Placeholder</p>
                    </div>
                    <div className="flex px-4">
                        <svg viewBox="0 0 731.65 700.61" className="h-12">
                            <path
                                d="M556,71c37.58,14.73,99.54,46,142,110,87.74,132.34,40,328.43-70,438C479.55,766.86,217.28,757.45,103,641a236,236,0,0,1-47-70c146.06,38.73,301.61-5,404-114C611.8,295.47,559.38,83.7,556,71Z"
                                transform="translate(-27.85 -44.57)"
                                fill="none"
                                stroke="white"
                                strokeMiterlimit="10"
                                strokeWidth="32"
                            />
                        </svg>
                        <svg viewBox="0 0 682 682" className="h-12">
                            <circle
                                cx="341"
                                cy="341"
                                r="100"
                                fill="none"
                                stroke="white"
                                strokeLinecap="round"
                                strokeMiterlimit="10"
                                strokeWidth="32"
                            />
                            <line
                                x1="341"
                                y1="16"
                                x2="341"
                                y2="166"
                                fill="none"
                                stroke="white"
                                strokeLinecap="round"
                                strokeMiterlimit="10"
                                strokeWidth="32"
                            />
                            <line
                                x1="341"
                                y1="516"
                                x2="341"
                                y2="666"
                                fill="none"
                                stroke="white"
                                strokeLinecap="round"
                                strokeMiterlimit="10"
                                strokeWidth="32"
                            />
                            <line
                                x1="16"
                                y1="341"
                                x2="166"
                                y2="341"
                                fill="none"
                                stroke="white"
                                strokeLinecap="round"
                                strokeMiterlimit="10"
                                strokeWidth="32"
                            />
                            <line
                                x1="516"
                                y1="341"
                                x2="666"
                                y2="341"
                                fill="none"
                                stroke="white"
                                strokeLinecap="round"
                                strokeMiterlimit="10"
                                strokeWidth="32"
                            />
                            <line
                                x1="467.97"
                                y1="214.03"
                                x2="574.03"
                                y2="107.97"
                                fill="none"
                                stroke="white"
                                strokeLinecap="round"
                                strokeMiterlimit="10"
                                strokeWidth="32"
                            />
                            <line
                                x1="107.97"
                                y1="574.03"
                                x2="214.03"
                                y2="467.97"
                                fill="none"
                                stroke="white"
                                strokeLinecap="round"
                                strokeMiterlimit="10"
                                strokeWidth="32"
                            />
                            <line
                                x1="107.97"
                                y1="107.97"
                                x2="214.03"
                                y2="214.03"
                                fill="none"
                                stroke="white"
                                strokeLinecap="round"
                                strokeMiterlimit="10"
                                strokeWidth="32"
                            />
                            <line
                                x1="467.97"
                                y1="467.97"
                                x2="574.03"
                                y2="574.03"
                                fill="none"
                                stroke="white"
                                strokeLinecap="round"
                                strokeMiterlimit="10"
                                strokeWidth="32"
                            />
                        </svg>
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
