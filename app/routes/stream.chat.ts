import type { LoaderFunction } from "@remix-run/node";

import type { Message } from "~/chat.server";
import { chatEmitter } from "~/chat.server";

export const loader: LoaderFunction = ({ request }) => {
    if (!request.signal) {
        return new Response(null, { status: 500 });
    }

    return new Response(
        new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();

                const handleMessage = (message: Message) => {
                    console.log("[NEW MESSAGE] ", message);
                    controller.enqueue(encoder.encode("event: newmessage\n"));
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
                };

                const close = () => {
                    chatEmitter.off("newmessage", handleMessage);
                    request.signal.removeEventListener("abort", close);
                    clearInterval(ping);
                    controller.close();
                };

                chatEmitter.on("newmessage", handleMessage);
                request.signal.addEventListener("abort", close);
                const ping = setInterval(() => {
                    controller.enqueue(encoder.encode(":keepalive\n\n"));
                }, 25 * 1000);

                if (request.signal.aborted) {
                    close();
                    return;
                }
            }
        }),
        { headers: { "Content-Type": "text/event-stream" } }
    );
};
