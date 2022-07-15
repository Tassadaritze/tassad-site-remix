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
import { createMessage, getMessages } from "~/models/message.server";
import { getSession } from "~/session.server";

interface LoaderMessage extends Omit<Awaited<ReturnType<typeof getMessages>>[number], "createdAt"> {
    createdAt: string;
}

type LoaderData = {
    users: typeof users;
    messageHistory: Awaited<ReturnType<typeof getMessages>>;
    title: string;
    description: string;
};

interface LoaderDataReturn extends Omit<LoaderData, "messageHistory"> {
    messageHistory: LoaderMessage[];
}

const isLoaderData = (obj: unknown): obj is LoaderData =>
    typeof (obj as LoaderData).title === "string" && typeof (obj as LoaderData).description === "string";

// only used client-side for now, re-declare on server side if necessary
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

    const messageHistory = await getMessages();

    return json<LoaderData>({ users, messageHistory, title, description });
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

    const newMessage: Message = {
        username,
        content: message,
        createdAt: new Date(Date.now()),
        type: Event.NewMessage
    };
    createMessage(username, Event.NewMessage, message).catch(console.error);
    chatEmitter.emit("newmessage", newMessage);

    return null;
};

const Chat = () => {
    const { users, messageHistory: loaderMessageHistory } = useLoaderData<LoaderDataReturn>();
    const messageHistory: Message[] = [];
    loaderMessageHistory.forEach(
        (loaderMessage, index) =>
            (messageHistory[index] = { ...loaderMessage, createdAt: new Date(loaderMessage.createdAt) })
    );

    const [messages, setMessages] = useState<Message[]>(messageHistory);
    const [isScrolled, setIsScrolled] = useState(true);
    const [usersState, setUsersState] = useState(users);
    const [inputLength, setInputLength] = useState(0);

    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const ulRef = useRef<HTMLUListElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const transition = useTransition();
    const isSending = transition.state === "submitting";
    useEffect(() => {
        if (isSending && inputRef.current && inputRef.current.value.length <= MAX_MESSAGE_LENGTH) {
            formRef.current?.reset();
            setInputLength(0);
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

    useEffect(() => endRef.current?.scrollIntoView(), []);

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
                        <span className="text-mauve-11 dark:text-mauve-dark-11">{`${message.createdAt
                            .toTimeString()
                            .slice(0, 5)} `}</span>
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
                        <span className="text-mauve-11 dark:text-mauve-dark-11">{`${message.createdAt
                            .toTimeString()
                            .slice(0, 5)} `}</span>
                        <strong>{message.username}: </strong>
                        {message.content}
                    </li>
                );
        }
    };

    const { t } = useTranslation("chat");
    const { t: tc } = useTranslation();

    const inputLengthStyle =
        inputLength > MAX_MESSAGE_LENGTH ? "text-red-11 dark:text-red-dark-11" : "text-blue-11 dark:text-blue-dark-11";

    return (
        <div>
            <p className="text-2xl text-amber-11 dark:text-amber-dark-11">{t("herokuInfo")}</p>
            <div className="flex">
                <main className="flex-gap-y-8 relative inset-2 flex w-11/12 flex-col lg:w-1/2">
                    <ul
                        ref={ulRef}
                        onScroll={handleScroll}
                        className="h-[600px] overflow-y-auto break-words border-x-2 border-t-2 border-violet-6 bg-violet-3 px-2 text-mauve-12 dark:border-violet-dark-6 dark:bg-violet-dark-3 dark:text-mauve-dark-12"
                    >
                        {messages.map((message, i) => parseMessage(message, i))}
                        {!isScrolled && (
                            <button
                                type="button"
                                onClick={() => endRef.current?.scrollIntoView()}
                                className="absolute bottom-[10%] left-[40%] rounded-md border-violet-alpha-7 bg-violet-alpha-9 px-2 text-mauve-dark-12 hover:border-violet-alpha-8 hover:bg-violet-alpha-10 dark:border-violet-dark-alpha-7 dark:bg-violet-dark-alpha-9 dark:hover:border-violet-dark-alpha-8 dark:hover:bg-violet-dark-alpha-10"
                            >
                                {t("scrollToNewMessages")}
                            </button>
                        )}
                        <div ref={endRef} />
                    </ul>
                    <Form method="post" ref={formRef} className="flex">
                        <div className="flex w-full flex-col">
                            <input
                                type="text"
                                name="message"
                                placeholder={t("chatMessageInputPlaceholder")}
                                autoComplete="off"
                                onInput={(e) => setInputLength(e.currentTarget.value.length)}
                                ref={inputRef}
                                className="border-2 border-violet-6 pl-1 text-violet-11 ring-violet-7 dark:border-violet-dark-6 dark:ring-violet-dark-7"
                            />
                            {inputLength + 100 > MAX_MESSAGE_LENGTH && (
                                <p className={`w-fit self-end px-2 ${inputLengthStyle}`}>
                                    {MAX_MESSAGE_LENGTH - inputLength}
                                </p>
                            )}
                        </div>
                        <button className="ml-1 h-fit border-2 border-violet-7 bg-violet-9 px-2 text-violet-dark-12 hover:border-violet-8 hover:bg-violet-10 dark:border-violet-dark-7 dark:bg-violet-dark-9 dark:hover:border-violet-dark-8 dark:hover:bg-violet-dark-10">
                            {tc("send")}
                        </button>
                    </Form>
                </main>
                <ChatUsers users={usersState} />
            </div>
        </div>
    );
};

const ChatUsers = ({ users }: { users: string[] }) => {
    const [isUsersVisible, setIsUsersVisible] = useState(false);

    const styleColours = isUsersVisible
        ? "bg-violet-5 dark:bg-violet-dark-5"
        : "bg-violet-3 dark:bg-violet-dark-3 hover:bg-violet-4 dark:hover:bg-violet-dark-4";

    const { t } = useTranslation("chat");

    return (
        <div className="relative inset-2 ml-2 flex max-h-[600px] flex-col">
            <button
                onClick={() => setIsUsersVisible((prevState) => !prevState)}
                className={`w-fit border-2 border-violet-7 p-1 text-4xl text-violet-11 hover:border-violet-8 dark:border-violet-dark-7 dark:text-violet-dark-11 dark:hover:border-violet-dark-8 ${styleColours}`}
            >
                {t("users")}
            </button>
            {isUsersVisible && (
                <ul className="h-full divide-y divide-violet-6 overflow-y-auto overflow-x-clip rounded-md bg-violet-2 p-1 dark:divide-violet-dark-6 dark:bg-violet-dark-2">
                    {users.map((user, i) => (
                        <li key={i}>{user}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Chat;
