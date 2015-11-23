import * as views from './view';
import { Silenceable } from './types';
export interface TemplateFunction {
    (locals: Object): string;
}
export interface TemplateViewRenderOptions extends Silenceable {
}
export interface TemplateViewOptions extends views.ViewOptions {
    template?: string | TemplateFunction;
}
export declare class TemplateView<T extends HTMLElement> extends views.View<T> {
    template: string | TemplateFunction;
    /** TemplateView
     * @param {TemplateViewOptions} options
     * @extends View
     */
    constructor(options?: TemplateViewOptions);
    getTemplateData(): any;
    render(options?: TemplateViewRenderOptions): any;
    protected renderTemplate(data: Object): void;
    protected attachTemplate(template: string): void;
}
