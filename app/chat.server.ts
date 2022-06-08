import { EventEmitter } from "events";

declare global {
    // eslint-disable-next-line no-var
    var __chatEmitter: EventEmitter;
}
global.__chatEmitter = global.__chatEmitter || new EventEmitter();
export const chatEmitter = __chatEmitter;
