export declare class Debug {
    static enable(enabled: boolean, namespace?: string): void;
    static loggers: {
        [key: string]: Debug;
    };
    static formatters: {
        [key: string]: (args: any) => string;
    };
    static create(namespace: string): (...args: any[]) => void;
    enabled: boolean;
    prefix: string;
    namespace: string;
    constructor(namespace: string);
    debug(...args: any[]): void;
    _log(...args: any[]): any;
    _coerce(val: any): any;
    _formatArgs(args: any): any[];
}
export declare function debug(namespace: string): (...args: any[]) => void;
