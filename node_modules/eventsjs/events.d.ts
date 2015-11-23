
declare module "eventsjs" {
	import tmp = require('eventsjs/lib/events')
	export = tmp
}

declare module "eventsjs/lib/events" {
	import tmp = require('lib/events')
	export = tmp
}