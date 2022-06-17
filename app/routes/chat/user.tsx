import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { commitSession, getSession } from "~/session.server";

type LoaderData = {
    error: string | undefined;
};

const USERNAME_CHAR_LIMIT = 32;

export const meta: MetaFunction = () => {
    return {
        title: "Portfolio Website - Chat Name Form",
        description: "Pick a username to use when chatting"
    };
};

export const loader: LoaderFunction = async ({ request }) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (session.has("username")) {
        return redirect("/chat");
    }

    const data = { error: session.get("error") as unknown };

    return json(data, {
        headers: {
            "Set-Cookie": await commitSession(session)
        }
    });
};

export const action: ActionFunction = async ({ request }) => {
    const session = await getSession(request.headers.get("Cookie"));
    const username = (await request.formData()).get("username");

    invariant(typeof username === "string", "username must be a string");

    if (username.length > USERNAME_CHAR_LIMIT) {
        session.flash("error", `Username cannot be longer than ${USERNAME_CHAR_LIMIT} characters`);

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

    return (
        <main className="relative top-[20vh] flex items-center justify-center align-middle">
            <Form method="post" className="flex flex-col items-center">
                {error ? <p className="text-red-700">{error}</p> : null}
                <label className="flex flex-col items-center py-4 text-4xl">
                    Enter a username to be shown in chat:{" "}
                    <input
                        name="username"
                        maxLength={USERNAME_CHAR_LIMIT}
                        className={`w-[32em] border-2 border-black px-2${error ? " border-red-700" : ""}`}
                    />
                </label>
                <button className="rounded-md bg-gray-300 px-2 text-4xl hover:bg-gray-200">Submit</button>
            </Form>
        </main>
    );
};

export default ChatUsernameForm;
