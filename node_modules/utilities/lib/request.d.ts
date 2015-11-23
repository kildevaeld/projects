import { IPromise } from './promises';
export interface Deferrable<U> {
    promise: IPromise<U>;
    done: (error: Error, result: U) => void;
    reject: (error: Error) => void;
    resolve: (result: U) => void;
}
export declare function queryParam(obj: any): string;
export declare class Request {
    private _method;
    private _url;
    private _xhr;
    private _data;
    constructor(_method: string, _url: string);
    send(data: any): Request;
    withCredentials(ret: any): Request;
    end(data?: any): IPromise<string>;
    json(data?: any): IPromise<Object>;
    progress(fn: any): Request;
    header(field: string, value: string): Request;
}
export declare module request {
    function get(url: any): Request;
    function post(url: any): Request;
    function put(url: any): Request;
    function del(url: any): Request;
}
