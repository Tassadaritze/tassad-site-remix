import type { ActionFunction, LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next";

import ColourSchemePicker from "~/components/ColourSchemePicker";
import LanguagePicker from "~/components/LanguagePicker";
import { langCookie } from "~/cookie.server";
import i18next from "~/i18next.server";
import { safeRedirect } from "~/utils";

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
    const formData = await request.formData();
    const lang = formData.get("lang");
    const redirectTo = formData.get("redirectTo");
    return redirect(safeRedirect(redirectTo), {
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

    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        setIsDarkMode(
            localStorage.theme === "dark" ||
                (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
        );
    }, []);

    return (
        <html lang={locale} dir={i18n.dir()} className={`h-full ${isDarkMode ? "dark" : ""}`}>
            <head>
                <Meta />
                <Links />
            </head>
            <body className="h-fit bg-white-alpha-1 text-mauve-11 dark:bg-violet-dark-1 dark:text-mauve-dark-11">
                <header className="flex h-16 items-center justify-between overflow-x-auto bg-violet-9 text-4xl text-mauve-dark-12 dark:bg-violet-dark-9">
                    <div className="flex gap-x-8 px-4">
                        <Link to="/" className="hover:text-blue-600 hover:underline">
                            {t("home")}
                        </Link>
                        <Link to="/chat" className="hover:text-blue-600 hover:underline">
                            {t("chat")}
                        </Link>
                    </div>
                    <div className="flex gap-x-4 px-4">
                        <ColourSchemePicker isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
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
