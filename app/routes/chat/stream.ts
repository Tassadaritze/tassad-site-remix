import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import type { Message } from "~/chat.server";
import { chatEmitter, Event } from "~/chat.server";
import { getSession } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    const session = await getSession(request.headers.get("Cookie"));
    const username = session.get("username") as unknown;

    if (typeof username !== "string") {
        return redirect("/chat");
    }

    return new Response(
        new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();

                const handleMessage = (message: Message, event: Event) => {
                    switch (event) {
                        case Event.NewMessage: {
                            console.log("[NEW MESSAGE] ", message);
                            controller.enqueue(encoder.encode("event: newmessage\n"));
                            break;
                        }
                        case Event.UserJoin: {
                            console.log("[USER JOIN] ", message);
                            controller.enqueue(encoder.encode("event: userjoin\n"));
                            break;
                        }
                        case Event.UserLeave: {
                            console.log("[USER LEAVE] ", message);
                            controller.enqueue(encoder.encode("event: userleave\n"));
                            break;
                        }
                        default: {
                            console.log("[UNKNOWN MESSAGE EVENT] ", message);
                        }
                    }
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
                };

                const close = () => {
                    chatEmitter.off("newmessage", handleMessage);
                    chatEmitter.off("userjoin", handleMessage);
                    chatEmitter.off("userleave", handleMessage);
                    request.signal.removeEventListener("abort", close);
                    clearInterval(ping);
                    controller.close();

                    chatEmitter.emit(
                        "userleave",
                        {
                            content: `${username} left the chat`,
                            createdAt: new Date(Date.now())
                        },
                        Event.UserLeave
                    );
                };

                chatEmitter.on("newmessage", handleMessage);
                chatEmitter.on("userjoin", handleMessage);
                chatEmitter.on("userleave", handleMessage);
                request.signal.addEventListener("abort", close);
                const ping = setInterval(() => {
                    controller.enqueue(encoder.encode(":keepalive\n\n"));
                }, 25 * 1000);

                if (request.signal.aborted) {
                    close();
                    return;
                }

                chatEmitter.emit(
                    "userjoin",
                    {
                        content: `${username} joined the chat`,
                        createdAt: new Date(Date.now())
                    },
                    Event.UserJoin
                );
            }
        }),
        { headers: { "Content-Type": "text/event-stream" } }
    );
};
