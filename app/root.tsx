import type { LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";
import React from "react";

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
    charset: "utf-8",
    title: "Portfolio Website",
    viewport: "width=device-width,initial-scale=1"
});

type LoaderData = {
    user: Awaited<ReturnType<typeof getUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
    return json<LoaderData>({
        user: await getUser(request)
    });
};

const App = () => {
    return (
        <html lang="en" className="h-full">
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
