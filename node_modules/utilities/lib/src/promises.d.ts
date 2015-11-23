export interface Thenable<R> {
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
}
export interface PromiseConstructor {
    new <R>(callback: (resolve: (value?: R | Thenable<R>) => void, reject: (error?: any) => void) => void): Promise<R>;
    resolve<R>(value?: R | Thenable<R>): Promise<R>;
    reject(error: any): Promise<any>;
    all<R>(promises: (R | Thenable<R>)[]): Promise<R[]>;
    race<R>(promises: (R | Thenable<R>)[]): Promise<R>;
}
export declare const Promise: PromiseConstructor;
export declare function isPromise(obj: any): boolean;
export declare function toPromise(obj: any): any;
export declare function thunkToPromise(fn: any): Promise<{}>;
export declare function arrayToPromise(obj: any): Promise<{}[]>;
export declare function objectToPromise(obj: any): Promise<any>;
export interface Deferred<T> {
    promise: Promise<T>;
    resolve: (result: T) => void;
    reject: (error: Error) => void;
    done: (error: Error, result: T) => void;
}
export declare function deferred<T>(fn?: any, ctx?: any, ...args: any[]): Deferred<T> | Promise<T>;
export declare function callback<T>(promise: Promise<T>, callback: (error: Error, result: T) => void, ctx?: any): void;
export declare function delay<T>(timeout?: number): Promise<T>;
export declare function eachAsync<T>(array: T[], iterator: (value: T) => Promise<void>, context?: any, accumulate?: boolean): Promise<void>;
export declare function mapAsync<T, U>(array: T[], iterator: (value: T) => Promise<U>, context?: any, accumulate?: boolean): Promise<U[]>;
