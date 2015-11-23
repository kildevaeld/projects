import { EventEmitter } from 'eventsjs';
export declare class BaseObject extends EventEmitter {
    static extend: <T>(proto: any, stat?: any) => T;
}
