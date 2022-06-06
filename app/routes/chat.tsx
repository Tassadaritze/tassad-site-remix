import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import invariant from "tiny-invariant";

import type { Message } from "~/models/message.server";
import { addMessage, getMessages } from "~/models/message.server";
import { useEffect, useRef } from "react";

interface JSONMessage extends Omit<Message, "createdAt"> {
    createdAt: string;
}

type LoaderData = {
    messages: JSONMessage[];
};

export const meta: MetaFunction = () => {
    return {
        title: "Portfolio Website - Chat",
        description: "Chat with other random people"
    };
};

export const loader: LoaderFunction = async () => {
    const messages = await getMessages();
    console.log("[LOADER] ", messages);
    return json({
        messages
    });
};

export const action: ActionFunction = async ({ request }) => {
    const message = (await request.formData()).get("message");
    invariant(typeof message === "string", "message must be a string");
    await addMessage(message);
    console.log("[ACTION] ", message);
    return null;
};

const Chat = () => {
    const { messages } = useLoaderData<LoaderData>();
    console.log("[COMPONENT] ", messages);

    const ULRef = useRef<HTMLUListElement>(null);

    const transition = useTransition();
    const isSending = transition.state === "submitting";
    const formRef = useRef<HTMLFormElement>(null);
    useEffect(() => {
        if (!isSending) {
            formRef.current?.reset();
            if (ULRef.current) {
                console.log(ULRef.current.scrollTopMax);
                ULRef.current.scrollTop = 10000;
            }
        }
    }, [isSending]);

    return (
        <main className="flex-gap-y-8 relative inset-2 flex w-11/12 flex-col lg:w-1/2">
            <ul ref={ULRef} className="h-[600px] overflow-y-auto border-x-2 border-t-2 border-black px-2">
                <li>
                    <b>Do NOT share personal information!</b>
                    <br />
                    <b>
                        {" "}
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                        non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </b>
                </li>
                {messages.map((message, i) => (
                    <li key={i}>
                        {`${message.createdAt.slice(11, 16)} `}
                        <b>User: </b>
                        {message.message}
                    </li>
                ))}
            </ul>
            <Form method="post" className="flex" ref={formRef}>
                <input
                    type="text"
                    name="message"
                    placeholder="Your message..."
                    className="w-full border-2 border-black"
                />
                <button className="bg-gray-400 px-2">Send</button>
            </Form>
        </main>
    );
};

export default Chat;
