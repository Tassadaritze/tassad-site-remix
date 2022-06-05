import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

type LoaderData = {
    messages: typeof messages;
};

export const meta: MetaFunction = () => {
    return {
        title: "Portfolio Website - Chat",
        description: "Chat with other random people"
    };
};

export const loader: LoaderFunction = () => {
    console.log("loader", messages);
    return json<LoaderData>({
        messages
    });
};

export const action: ActionFunction = async ({ request }) => {
    console.log("action start", messages);
    const message = (await request.formData()).get("message");
    invariant(typeof message === "string", "message must be a string");
    console.log("[ACTION] ", message);
    messages.push(message);
    console.log("action end", messages);
    return null;
};

const Chat = () => {
    const { messages } = useLoaderData<LoaderData>();

    return (
        <main className="flex-gap-y-8 relative inset-2 flex max-h-[600px] w-11/12 flex-col lg:w-1/2">
            <ul className="overflow-y-auto border-2 border-black px-2">
                <li>
                    <b>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                        non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </b>
                </li>
                {messages.map((message, i) => (
                    <li key={i}>
                        <b>User: </b>
                        {message}
                    </li>
                ))}
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                {/*[...Array(40)].map((e, i) => (
                    <li key={i}>
                        <b>User:</b> Message
                    </li>
                ))*/}
            </ul>
            <Form method="post" className="flex">
                <input type="text" name="message" className="w-full border-b-2 border-l-2 border-r-2 border-black" />
                <button className="bg-gray-400 px-2">Send</button>
            </Form>
        </main>
    );
};

export default Chat;
