import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useTransition } from "@remix-run/react";
import invariant from "tiny-invariant";
import * as React from "react";
import { useEffect, useRef, useState } from "react";

import type { Message } from "~/chat.server";
import { chatEmitter, Event } from "~/chat.server";
import { getSession } from "~/session.server";

const isMessage = (message: unknown): message is Message => {
    return (
        !!message &&
        typeof message === "object" &&
        !!(message as Message).content &&
        (message as Message).createdAt instanceof Date
    );
};

const MAX_MESSAGE_LENGTH = 1869;

export const meta: MetaFunction = () => {
    return {
        title: "Portfolio Website - Chat",
        description: "Chat with other random people"
    };
};

export const loader: LoaderFunction = async ({ request }) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (!session.has("username")) {
        return redirect("/chat/user");
    }

    return null;
};

export const action: ActionFunction = async ({ request }) => {
    const session = await getSession(request.headers.get("Cookie"));
    const username = session.get("username") as unknown;

    if (typeof username !== "string") {
        return redirect("/chat/user");
    }

    const message = (await request.formData()).get("message");

    invariant(typeof message === "string", "message must be a string");

    if (message.length < 1) {
        console.error("message must be longer than 0 characters");
        return null;
    }

    chatEmitter.emit(
        "newmessage",
        {
            username,
            content: message,
            createdAt: new Date(Date.now())
        },
        Event.NewMessage
    );

    return null;
};

const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isScrolled, setIsScrolled] = useState(true);

    const formRef = useRef<HTMLFormElement>(null);
    const ulRef = useRef<HTMLUListElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const transition = useTransition();
    const isSending = transition.state === "submitting";
    useEffect(() => {
        if (!isSending) {
            formRef.current?.reset();
        }
    }, [isSending]);

    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            invariant(typeof e.data === "string", "event stream event data must be a string");
            const message = JSON.parse(e.data, (k, v: unknown) => {
                if (k === "createdAt" && typeof v === "string") {
                    return new Date(v);
                }
                return v;
            }) as Message;
            invariant(isMessage(message), "event stream newmessage event data must be a Message");
            setMessages((prevState) => {
                return [...prevState, message];
            });
            // Scroll to bottom on new message if list was scrolled to bottom before
            if (
                ulRef.current &&
                ulRef.current.firstElementChild?.clientHeight &&
                Math.abs(ulRef.current.scrollHeight - ulRef.current.clientHeight - ulRef.current.scrollTop) <
                    ulRef.current.firstElementChild.clientHeight + 1
            ) {
                endRef.current?.scrollIntoView();
            }
        };

        const source = new EventSource("/chat/stream/chat");
        source.addEventListener("newmessage", handleMessage);
        source.addEventListener("userjoin", handleMessage);
        source.addEventListener("userleave", handleMessage);

        return () => {
            source.close();
        };
    }, []);

    const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
        if (
            (!isScrolled &&
                e.currentTarget.firstElementChild?.clientHeight &&
                Math.abs(e.currentTarget.scrollHeight - e.currentTarget.clientHeight - e.currentTarget.scrollTop) <
                    e.currentTarget.firstElementChild.clientHeight + 1) ||
            (isScrolled &&
                e.currentTarget.firstElementChild?.clientHeight &&
                Math.abs(e.currentTarget.scrollHeight - e.currentTarget.clientHeight - e.currentTarget.scrollTop) >
                    e.currentTarget.firstElementChild.clientHeight + 1)
        ) {
            setIsScrolled((prevState) => !prevState);
        }
    };

    return (
        <main className="flex-gap-y-8 relative inset-2 flex w-11/12 flex-col lg:w-1/2">
            <ul
                ref={ulRef}
                onScroll={handleScroll}
                className="h-[600px] overflow-y-auto border-x-2 border-t-2 border-black px-2"
            >
                {messages.map((message, i) => (
                    <li key={i}>
                        {`${message.createdAt.toTimeString().slice(0, 5)} `}
                        {message.username ? <strong>{message.username}: </strong> : null}
                        {message.username ? message.content : <strong>{message.content}</strong>}
                    </li>
                ))}
                <div ref={endRef} />
            </ul>
            {!isScrolled && (
                <button
                    type="button"
                    onClick={() => endRef.current?.scrollIntoView()}
                    className="absolute bottom-12 left-[40%] rounded-md bg-black/50 px-2 text-white hover:bg-gray-900/50"
                >
                    Scroll to new messages
                </button>
            )}
            <Form method="post" ref={formRef} className="flex">
                <input
                    type="text"
                    name="message"
                    placeholder="Your message..."
                    autoComplete="off"
                    className="w-full border-2 border-black"
                />
                <button className="bg-gray-400 px-2">Send</button>
            </Form>
        </main>
    );
};

export default Chat;
