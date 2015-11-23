import {ajax} from './utils'
import {IPromise, Promise, deferred, Deferred} from './promises'
  let xmlRe = /^(?:application|text)\/xml/,
      jsonRe = /^application\/json/,
      fileProto = /^file:/;

export interface Deferrable<U> {
  promise: IPromise<U>
  done: (error:Error,result:U) => void
  reject: (error:Error) => void
  resolve: (result:U) => void
}

export function queryParam ( obj ): string {
  return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
}

var isValid = function(xhr, url) {
    return (xhr.status >= 200 && xhr.status < 300) ||
      (xhr.status === 304) ||
      (xhr.status === 0 && fileProto.test(url));
      //(xhr.status === 0 && window.location.protocol === 'file:')
  };

export class Request {

    private _xhr: XMLHttpRequest
    private _data: any
    constructor (private _method: string, private _url: string) {
      this._xhr = ajax()
    }

    send (data:any): Request {
      this._data = data;
      return this;
    }

    withCredentials (ret): Request {
      this._xhr.withCredentials = ret;
      return this;
    }

    end (data?:any): IPromise<string> {
      this._data = data||this._data;

      let defer = <Deferred<string>>deferred<string>();

      this._xhr.addEventListener('readystatechange', () => {
        if (this._xhr.readyState !== XMLHttpRequest.DONE) return;

        if (!isValid(this._xhr, this._url)) {
          return defer.reject(new Error('server responded with: ' + this._xhr.status));
        }


        defer.resolve(this._xhr.responseText);

      });

      data = this._data;
      let url = this._url;
      if (data && data === Object(data) /* && check for content-type */) {
        let d = queryParam(data)
        url += d
      }

      this._xhr.open(this._method, url, true);



      this._xhr.send(data);

      return defer.promise;

    }

    json (data?: any): IPromise<Object> {

      return this.end(data)
      .then<Object>((str) => {
        let accepts = this._xhr.getResponseHeader('content-type')

        if (jsonRe.test(accepts) && str !== '') {
          let json = JSON.parse(str)
          return json
        } else {
          throw new Error('json')
        }


      })
    }

    progress (fn) {
      this._xhr.addEventListener('progress', fn);
      return this;
    }

    header (field: string, value: string): Request {
      this._xhr.setRequestHeader(field,value)
      return this
    }
  }



export module request {
  export function get (url): Request {
      return new Request('GET', url)
  }

  export function post (url): Request {
      return new Request('POST', url)
  }

  export function put (url): Request {
      return new Request('PUT', url)
    }

    export function del (url): Request {
      return new Request('DELETE', url)
    }
}
