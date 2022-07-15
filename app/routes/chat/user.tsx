import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import invariant from "tiny-invariant";
import i18next from "~/i18next.server";

import { commitSession, getSession, isUsernameAvailable } from "~/session.server";

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

    if (username.length > USERNAME_CHAR_LIMIT || !(await isUsernameAvailable(username))) {
        const t = await i18next.getFixedT(request, "chat.user");
        username.length > USERNAME_CHAR_LIMIT
            ? session.flash("error", `${t("chatUsernameTooLongError")} ${USERNAME_CHAR_LIMIT} ${t("characters")}`)
            : session.flash("error", t("chatUsernameInUseError"));

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
                {typeof error === "string" ? <p className="text-red-11 dark:text-red-dark-11">{error}</p> : null}
                <label className="flex flex-col items-center py-4 text-4xl dark:text-mauve-dark-12">
                    {t("chatUsernameFormLabel")}{" "}
                    <input
                        name="username"
                        maxLength={USERNAME_CHAR_LIMIT}
                        className={`w-[32em] border-2 px-2 text-violet-11 ${
                            error ? "border-red-8 dark:border-red-dark-8" : ""
                        }`}
                    />
                </label>
                <button className="border-1 rounded-md border-violet-7 bg-violet-9 px-2 text-4xl text-violet-dark-12 hover:border-violet-8 hover:bg-violet-10 dark:border-violet-dark-7 dark:bg-violet-dark-9 dark:hover:border-violet-dark-8 dark:hover:bg-violet-dark-10">
                    {tc("submit")}
                </button>
            </Form>
        </main>
    );
};

export default ChatUsernameForm;
