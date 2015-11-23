


declare module "collection" {
	import tmp = require('collection/lib/index')
	export = tmp
}

declare module "collection/lib/index" {
	import tmp = require('lib/index')
	export = tmp
}