import { EventEmitter } from "events";

declare global {
    var __chatEmitter: EventEmitter;
    var __users: string[];
}
global.__chatEmitter = global.__chatEmitter || new EventEmitter();
global.__users = global.__users || [];
export const chatEmitter = __chatEmitter;
export const users = __users;

export const enum Event {
    NewMessage,
    UserJoin,
    UserLeave
}

export type Message = {
    username: string | undefined;
    content: string;
    createdAt: Date;
};
