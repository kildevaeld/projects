import { EventEmitter } from 'eventsjs';
/** Base object */
export declare class BaseObject extends EventEmitter {
    static extend: <T>(proto: any, stat?: any) => T;
    private _isDestroyed;
    /**
     * Object
     * @extends EventEmitter
     */
    constructor(args?: any);
    /**
     * Whether the object is "destroyed" or not
     * @type boolean
     */
    isDestroyed: boolean;
    destroy(): any;
    triggerMethod(eventName: string, ...args: any[]): any;
    getOption(prop: string, ...args: Object[]): any;
}
