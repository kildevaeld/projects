import {bind} from './utils'

export class Debug {
    static enable (enabled:boolean, namespace?:string) {
      for (let k in this.loggers) {
        if (namespace && k === namespace) {
          this.loggers[k].enabled = enabled
        } else if (!namespace) {
          this.loggers[k].enabled = enabled
        }
      }
    }
    static loggers: {[key:string]: Debug} = {}
    static formatters: {[key:string]: (args:any) => string } = {
      j: function (args:any) {
        return JSON.stringify(args);
      }
    }
    
    static create(namespace:string): (...args:any[]) => void {
      let logger
      if (this.loggers[namespace]) {
         logger = this.loggers[namespace].debug
      } else {
        logger = new Debug(namespace);
        this.loggers[namespace] = logger  
      }
      
      return bind(logger.debug, logger)
    }
    
    enabled:boolean = false
    prefix: string
    namespace:string
    constructor(namespace:string) {
      this.namespace = namespace
    }
    
    debug (...args:any[]) {
      if (!this.enabled) return;
 

      args[0] = this._coerce(args[0]);

      if ('string' !== typeof args[0]) {
        // anything else let's inspect with %o
        args = ['%o'].concat(args);
      }

      // apply any `formatters` transformations
      var index = 0;
      args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
        // if we encounter an escaped % then don't increase the array index
        if (match === '%%') return match;
        index++;
        var formatter = Debug.formatters[format];
        if ('function' === typeof formatter) {
          var val = args[index];
          match = formatter.call(self, val);
  
          // now we need to remove `args[index]` since it's inlined in the `format`
          args.splice(index, 1);
          index--;
        }
        return match;
      });
    
      args = this._formatArgs(args); 
   
      this._log(...args)

    }
    
    _log (...args:any[]) {
      return 'object' === typeof console
        && console.log
        && Function.prototype.apply.call(console.log, console, arguments);
    }
    
    _coerce(val) {
      if (val instanceof Error) return val.stack || val.message;
      return val;
    }
    
    _formatArgs(args): any[] {
      let p = this.prefix ? this.prefix + ":" : ''
      args[0] = `[${p}:${this.namespace}] ${args[0]}`;
      return args;
    }
  }
  
  export function debug(namespace:string): (...args:any[]) => void {
    return Debug.create(namespace)
  }