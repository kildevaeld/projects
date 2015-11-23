
declare module "utilities" {
	import tmp = require('utilities/lib/index')
	export = tmp
}

declare module "utilities/lib/index" {
	import tmp = require('lib/index')
	export = tmp
}