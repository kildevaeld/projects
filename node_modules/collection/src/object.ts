/// <reference path="interfaces" />
import {EventEmitter} from 'eventsjs'
import {inherits} from 'utilities/lib/utils'

export class BaseObject extends EventEmitter {
  static extend = function <T>(proto: any, stat?: any): T {
    return inherits(this, proto, stat);
  }
}