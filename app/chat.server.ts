import { EventEmitter } from "events";

declare global {
    var __chatEmitter: EventEmitter;
    var __users: string[];
    var __messageHistory: Message[];
}
global.__chatEmitter = global.__chatEmitter || new EventEmitter();
global.__users = global.__users || [];
global.__messageHistory = global.__messageHistory || [];

export const chatEmitter = __chatEmitter;
export const users = __users;
export const messageHistory = __messageHistory;

export const enum Event {
    NewMessage,
    UserJoin,
    UserLeave
}

export type Message = {
    username: string;
    content?: string;
    createdAt: Date;
    type: Event;
};

const MAX_MESSAGE_HISTORY = 100;
export const addToHistory = (message: Message) => {
    messageHistory.push(message);
    while (messageHistory.length > MAX_MESSAGE_HISTORY) {
        messageHistory.shift();
    }
};
