export declare let utils: {
    isObject(obj: any): boolean;
    extend(obj: Object, ...args: Object[]): any;
    pick(obj: Object, props: string[]): any;
    has(obj: any, prop: any): any;
    indexOf(array: any, item: any): number;
    result(obj: any, prop: string, ctx?: any, args?: any[]): any;
    bind(method: Function, context: any, ...args: any[]): Function;
    call(fn: Function, ctx: any, args: any[]): any;
    slice(array: any): any;
    uniqueId(prefix?: string): string;
};
