import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import invariant from "tiny-invariant";
import i18next from "~/i18next.server";

import { commitSession, getSession } from "~/session.server";

type LoaderData = {
    error: unknown;
    title: string;
    description: string;
};

const isLoaderData = (obj: unknown): obj is LoaderData =>
    typeof (obj as LoaderData).title === "string" && typeof (obj as LoaderData).description === "string";

const USERNAME_CHAR_LIMIT = 32;

export const meta: MetaFunction = ({ data }: { data: unknown }) => {
    const { title, description } = isLoaderData(data) ? data : { title: "", description: "" };
    return {
        title,
        description
    };
};

export const loader: LoaderFunction = async ({ request }) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (session.has("username")) {
        return redirect("/chat");
    }

    const t = await i18next.getFixedT(request, "chat.user");
    const data = { error: session.get("error") as unknown, title: t("title"), description: t("description") };

    return json(data, {
        headers: {
            "Set-Cookie": await commitSession(session)
        }
    });
};

export const action: ActionFunction = async ({ request }) => {
    const session = await getSession(request.headers.get("Cookie"));
    let username = (await request.formData()).get("username");

    invariant(typeof username === "string", "username must be a string");

    username = username.trim();

    if (username.length > USERNAME_CHAR_LIMIT) {
        const t = await i18next.getFixedT(request, "chat.user");
        session.flash("error", `${t("chatUsernameTooLongError")} ${USERNAME_CHAR_LIMIT} ${t("characters")}`);

        return redirect("/chat/user", {
            headers: {
                "Set-Cookie": await commitSession(session)
            }
        });
    }

    session.set("username", username);

    return redirect("/chat", {
        headers: {
            "Set-Cookie": await commitSession(session)
        }
    });
};

const ChatUsernameForm = () => {
    const { error } = useLoaderData<LoaderData>();
    const { t } = useTranslation("chat.user");
    const { t: tc } = useTranslation();

    return (
        <main className="relative top-[20vh] flex items-center justify-center align-middle">
            <Form method="post" className="flex flex-col items-center">
                {typeof error === "string" ? <p className="text-red-700">{error}</p> : null}
                <label className="flex flex-col items-center py-4 text-4xl">
                    {t("chatUsernameFormLabel")}{" "}
                    <input
                        name="username"
                        maxLength={USERNAME_CHAR_LIMIT}
                        className={`w-[32em] border-2 border-black px-2${error ? " border-red-700" : ""}`}
                    />
                </label>
                <button className="rounded-md bg-gray-300 px-2 text-4xl hover:bg-gray-200">{tc("submit")}</button>
            </Form>
        </main>
    );
};

export default ChatUsernameForm;
