import { json, redirect } from "@remix-run/node";
import type { LinksFunction, LoaderFunction, MetaFunction, ActionFunction } from "@remix-run/node";
import { Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { useChangeLanguage } from "remix-i18next";
import { useTranslation } from "react-i18next";
import { MoonIcon, SunIcon } from "~/components/Icons";

import LanguagePicker from "~/components/LanguagePicker";
import { langCookie } from "~/cookie.server";
import i18next from "~/i18next.server";

import tailwindStylesheetUrl from "./styles/tailwind.css";

type LoaderData = { locale: string; title: string };

const isLoaderData = (obj: unknown): obj is LoaderData =>
    typeof (obj as LoaderData).title === "string" && typeof (obj as LoaderData).locale === "string";

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = ({ data }: { data: unknown }) => {
    const { title } = isLoaderData(data) ? data : { title: "" };
    return {
        charset: "utf-8",
        title,
        viewport: "width=device-width,initial-scale=1"
    };
};

export const loader: LoaderFunction = async ({ request }) => {
    const locale = await i18next.getLocale(request);

    const t = await i18next.getFixedT(locale, "root");
    const title = t("title");

    return json<LoaderData>({ locale, title });
};

export const action: ActionFunction = async ({ request }) => {
    const lang = (await request.formData()).get("lang");
    return redirect("/", {
        headers: {
            "Set-Cookie": await langCookie.serialize(lang)
        }
    });
};

export const handle = {
    i18n: "common"
};

const App = () => {
    const { locale } = useLoaderData<LoaderData>();

    const { i18n, t } = useTranslation("root");

    useChangeLanguage(locale);

    return (
        <html lang={locale} dir={i18n.dir()} className="h-full">
            <head>
                <Meta />
                <Links />
            </head>
            <body className="h-fit w-full">
                <header className="flex h-16 min-w-full items-center justify-between bg-gray-800 text-4xl text-white">
                    <div className="flex gap-x-8 px-4">
                        <Link to="/" className="hover:text-blue-600 hover:underline">
                            {t("home")}
                        </Link>
                        <Link to="/chat" className="hover:text-blue-600 hover:underline">
                            {t("chat")}
                        </Link>
                        <p>Placeholder</p>
                    </div>
                    <div className="flex gap-x-4 px-4">
                        <MoonIcon />
                        <SunIcon />
                        <LanguagePicker />
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
