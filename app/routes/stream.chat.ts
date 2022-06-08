import type { LoaderFunction } from "@remix-run/node";

import { chatEmitter } from "~/chat.server";

export const loader: LoaderFunction = ({ request }) => {
    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            const handleMessage = (message: string) => {
                console.log("[NEW MESSAGE] ", message);
                controller.enqueue(encoder.encode("event: newmessage\n"));
                controller.enqueue(encoder.encode(`data: ${message}\n\n`));
            };

            const close = () => {
                chatEmitter.off("newmessage", handleMessage);
                request.signal.removeEventListener("abort", close);
                controller.close();
            };

            chatEmitter.on("newmessage", handleMessage);
            request.signal.addEventListener("abort", close);
        }
    });
    return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
};
