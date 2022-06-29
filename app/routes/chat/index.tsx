import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import invariant from "tiny-invariant";

import type { Message } from "~/chat.server";
import { chatEmitter, Event, users } from "~/chat.server";
import i18next from "~/i18next.server";
import { getSession } from "~/session.server";

type LoaderData = {
    users: typeof users;
    title: string;
    description: string;
};

const isLoaderData = (obj: unknown): obj is LoaderData =>
    typeof (obj as LoaderData).title === "string" && typeof (obj as LoaderData).description === "string";

const isMessage = (message: unknown): message is Message => {
    return (
        typeof (message as Message).username === "string" &&
        (!(message as Message).content || typeof (message as Message).content === "string") &&
        (message as Message).createdAt instanceof Date &&
        typeof (message as Message).type === "number"
    );
};

const MAX_MESSAGE_LENGTH = 1869;

export const meta: MetaFunction = ({ data }: { data: unknown }) => {
    const { title, description } = isLoaderData(data) ? data : { title: "", description: "" };
    return {
        title,
        description
    };
};

export const loader: LoaderFunction = async ({ request }) => {
    const session = await getSession(request.headers.get("Cookie"));

    if (!session.has("username")) {
        return redirect("/chat/user");
    }

    const t = await i18next.getFixedT(request, "chat");
    const { title, description } = { title: t("title"), description: t("description") };

    return json<LoaderData>({ users, title, description });
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
    } else if (message.length > MAX_MESSAGE_LENGTH) {
        console.error("message must be shorter than MAX_MESSAGE_LENGTH");
        return null;
    }

    chatEmitter.emit("newmessage", {
        username,
        content: message,
        createdAt: new Date(Date.now()),
        type: Event.NewMessage
    });

    return null;
};

const Chat = () => {
    const { users } = useLoaderData<LoaderData>();

    const [messages, setMessages] = useState<Message[]>([]);
    const [isScrolled, setIsScrolled] = useState(true);
    const [usersState, setUsersState] = useState(users);
    const [inputLength, setInputLength] = useState(0);

    const formRef = useRef<HTMLFormElement>(null);
    const ulRef = useRef<HTMLUListElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const transition = useTransition();
    const isSending = transition.state === "submitting";
    useEffect(() => {
        if (isSending && inputLength <= MAX_MESSAGE_LENGTH) {
            formRef.current?.reset();
            setInputLength(0);
        }
    }, [inputLength, isSending]);

    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            invariant(typeof e.data === "string", "event stream event data must be a string");
            const message = JSON.parse(e.data, (k, v: unknown) => {
                if (k === "createdAt" && typeof v === "string") {
                    return new Date(v);
                }
                return v;
            }) as unknown;
            invariant(isMessage(message), "event stream newmessage event data must be a Message");
            switch (e.type) {
                case "userjoin": {
                    setUsersState((prevState) => [...prevState, message.username]);
                    break;
                }
                case "userleave": {
                    setUsersState((prevState) => {
                        const users = [...prevState];
                        const userIndex = users.indexOf(message.username);
                        if (userIndex > -1) {
                            users.splice(userIndex, 1);
                        }
                        return users;
                    });
                    break;
                }
                default:
            }
            setMessages((prevState) => {
                return [...prevState, message];
            });
            // Scroll to bottom on new message if list was scrolled to bottom before
            if (
                endRef.current &&
                ulRef.current &&
                endRef.current.previousElementSibling?.clientHeight &&
                Math.abs(ulRef.current.scrollHeight - ulRef.current.clientHeight - ulRef.current.scrollTop) <
                    endRef.current.previousElementSibling.clientHeight + 1
            ) {
                endRef.current?.scrollIntoView();
            }
        };

        const source = new EventSource("/chat/stream");
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

    const parseMessage = (message: Message, key: React.Key): JSX.Element => {
        switch (message.type) {
            // Event.UserJoin and Event.UserLeave
            case 1:
            case 2: {
                return (
                    <li key={key}>
                        {`${message.createdAt.toTimeString().slice(0, 5)} `}
                        <strong>
                            {`${message.username} `}
                            {message.type === 1 ? t("eventChatJoin") : t("eventChatLeave")}
                        </strong>
                    </li>
                );
            }
            default:
                return (
                    <li key={key}>
                        {`${message.createdAt.toTimeString().slice(0, 5)} `}
                        <strong>{message.username}: </strong>
                        {message.content}
                    </li>
                );
        }
    };

    const { t } = useTranslation("chat");
    const { t: tc } = useTranslation();

    const inputLengthStyle = inputLength > MAX_MESSAGE_LENGTH ? " text-red-700" : "";

    return (
        <div className="flex">
            <main className="flex-gap-y-8 relative inset-2 flex w-11/12 flex-col lg:w-1/2">
                <ul
                    ref={ulRef}
                    onScroll={handleScroll}
                    className="h-[600px] overflow-y-auto break-words border-x-2 border-t-2 border-black px-2"
                >
                    {messages.map((message, i) => parseMessage(message, i))}
                    <div ref={endRef} />
                </ul>
                {!isScrolled && (
                    <button
                        type="button"
                        onClick={() => endRef.current?.scrollIntoView()}
                        className="absolute bottom-[10%] left-[40%] rounded-md bg-black/70 px-2 text-white hover:bg-gray-900/50"
                    >
                        {t("scrollToNewMessages")}
                    </button>
                )}
                <Form method="post" ref={formRef} className="flex">
                    <div className="flex w-full flex-col">
                        <input
                            type="text"
                            name="message"
                            placeholder={t("chatMessageInputPlaceholder")}
                            autoComplete="off"
                            className="border-2 border-black"
                            onInput={(e) => setInputLength(e.currentTarget.value.length)}
                        />
                        {inputLength + 100 > MAX_MESSAGE_LENGTH && (
                            <p className={`w-fit self-end px-2${inputLengthStyle}`}>
                                {MAX_MESSAGE_LENGTH - inputLength}
                            </p>
                        )}
                    </div>
                    <button className="h-fit border-y-2 border-r-2 border-black bg-gray-400 px-2 hover:bg-gray-300">
                        {tc("send")}
                    </button>
                </Form>
            </main>
            <ChatUsers users={usersState} />
        </div>
    );
};

const ChatUsers = ({ users }: { users: string[] }) => {
    const [isUsersVisible, setIsUsersVisible] = useState(false);

    const styleColours = isUsersVisible
        ? " text-black bg-gray-400 hover:bg-gray-300 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.5)]"
        : " text-white bg-gray-500 hover:bg-gray-400";

    const { t } = useTranslation("chat");

    return (
        <div className="relative inset-2 flex max-h-[600px] flex-col">
            <button
                onClick={() => setIsUsersVisible((prevState) => !prevState)}
                className={`w-fit border-y-2 border-r-2 border-black p-1 text-4xl ${styleColours}`}
            >
                {t("users")}
            </button>
            {isUsersVisible && (
                <ul className="w-fit list-outside list-disc overflow-y-auto overflow-x-clip bg-black px-6 text-white">
                    {users.map((user, i) => (
                        <li key={i}>{user}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Chat;
