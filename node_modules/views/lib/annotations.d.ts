export declare function attributes(attrs: Object): ClassDecorator;
export declare function events(events: {
    [key: string]: string | Function;
}): ClassDecorator;
export declare function triggers(triggers: {
    [key: string]: string;
}): ClassDecorator;
