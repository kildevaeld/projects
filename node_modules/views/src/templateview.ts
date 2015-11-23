
import * as views from './view'
import {Silenceable} from './types'
import {logger} from './debug'
const debug = logger('templateview')

export interface TemplateFunction {
  (locals:Object): string
}

export interface TemplateViewRenderOptions extends Silenceable  {

}

export interface TemplateViewOptions extends views.ViewOptions {
  template?: string|TemplateFunction
}

export class TemplateView<T extends HTMLElement> extends views.View<T> {
  public template: string|TemplateFunction

  /** TemplateView
   * @param {TemplateViewOptions} options
   * @extends View
   */
  public constructor (options?: TemplateViewOptions) {

    if (options && options.template) {
      this.template = options.template
    }

    super(options)
  }

  public getTemplateData (): any {
    return {}
  }

  public render (options:TemplateViewRenderOptions={}): any {
    
    if (!options.silent) 
      this.triggerMethod('before:render')
    
    this.renderTemplate(this.getTemplateData())

    if (!options.silent)
      this.triggerMethod('render')

    return this
  }
  
  protected renderTemplate(data:Object) {
    let template = this.getOption('template')
    
    if (typeof template === 'function') {
      debug('%s render template function', this.cid);
      template = template.call(this, data)
    } 
    
    if (template && typeof template === 'string') {
        debug('%s attach template: %s', this.cid, template);
       this.attachTemplate(template)
    }
    
  }
  
  protected attachTemplate(template: string) {
    this.undelegateEvents()
    this.el.innerHTML = template
    this.delegateEvents()
  }

}
