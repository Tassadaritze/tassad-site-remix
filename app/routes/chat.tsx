import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { Form, useTransition } from "@remix-run/react";
import invariant from "tiny-invariant";
import * as React from "react";
import { useEffect, useRef, useState } from "react";

import { chatEmitter } from "~/chat.server";

export const meta: MetaFunction = () => {
    return {
        title: "Portfolio Website - Chat",
        description: "Chat with other random people"
    };
};

export const action: ActionFunction = async ({ request }) => {
    const message = (await request.formData()).get("message");
    invariant(typeof message === "string", "message must be a string");
    chatEmitter.emit("newmessage", message);
    return null;
};

const canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);

const useLayoutEffect = canUseDOM
    ? React.useLayoutEffect
    : () => {
          return;
      };

const Chat = () => {
    const [messages, setMessages] = useState<string[]>([]);

    const formRef = useRef<HTMLFormElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const transition = useTransition();
    const isSending = transition.state === "submitting";
    const isLoading = transition.state === "loading";
    useEffect(() => {
        if (!isSending) {
            formRef.current?.reset();
        }
    }, [isSending]);
    useLayoutEffect(() => {
        if (!isLoading) {
            endRef.current?.scrollIntoView();
        }
    }, [isLoading]);

    useEffect(() => {
        const source = new EventSource("/stream/chat");
        source.onmessage = function (ev) {
            console.log("[LITERALLY ANYTHING] ", ev);
        };
        return () => {
            source.close();
        };
    }, []);

    return (
        <main className="flex-gap-y-8 relative inset-2 flex w-11/12 flex-col lg:w-1/2">
            <ul className="h-[600px] overflow-y-auto border-x-2 border-t-2 border-black px-2">
                {messages.map((message, i) => (
                    <li key={i}>
                        <strong>User: </strong>
                        {message}
                    </li>
                ))}
                <div ref={endRef} />
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
