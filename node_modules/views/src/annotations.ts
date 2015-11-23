import {extend} from 'utilities'
import {RegionMap} from './region-manager'

export function attributes(attrs:Object): ClassDecorator {
	return function <T extends Function>(target:T) {
		extend(target.prototype, attrs)
	}
}
export function events(events:{[key:string]: string|Function}): ClassDecorator {
	return function <T extends Function>(target:T) {
		target.prototype.events = events
	}
}

export function triggers(triggers:{[key: string]: string}): ClassDecorator {
	return function<T extends Function>(target:T) {
		target.prototype.triggers = triggers
	}
}

