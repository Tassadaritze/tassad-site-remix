import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import invariant from "tiny-invariant";

export const loader: LoaderFunction = () => {
    // return redirect("chat/");
    return null;
};

export const action: ActionFunction = async ({ request }) => {
    const username = (await request.formData()).get("username");
    invariant(typeof username === "string", "username must be a string");
    console.log(username);
    return null;
};

const ChatUserNamePicker = () => {
    return (
        <main className="relative top-[20vh] flex items-center justify-center align-middle">
            <Form method="post" className="flex flex-col items-center">
                <label className="flex flex-col items-center py-4 text-4xl">
                    Enter your name to be shown in chat:{" "}
                    <input name="username" maxLength={32} className="w-[32em] border-2 border-black px-2" />
                </label>
                <button className="rounded-md bg-gray-300 px-2 text-4xl hover:bg-gray-200">Submit</button>
            </Form>
        </main>
    );
};

export default ChatUserNamePicker;
