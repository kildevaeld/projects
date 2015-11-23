'use strict'
var events = require('../lib/events')

describe('EventEmitter', function () {
	
	it('should instantiate', function () {
		var emitter = new events.EventEmitter()
		
		expect(emitter).toEqual(jasmine.any(events.EventEmitter))	
		expect(emitter.listeners).not.toBe({})
	
	})
	
	it('should trigger once', function () {

		var spy = jasmine.createSpy('once')
		
		var emitter = new events.EventEmitter()
		
		emitter.once('event', spy)
		
		emitter.trigger('event', 'test', 'once')
		emitter.trigger('event', 'again')
		
		expect(spy.calls.count()).toEqual(1)
		expect(spy).toHaveBeenCalledWith('test','once')
		
	})
	
	it('should trigger', function () {

		var spy = jasmine.createSpy('once')
		
		var emitter = new events.EventEmitter()
		
		emitter.on('event', spy)
		
		emitter.trigger('event', 'test', 'once')
		emitter.trigger('event', 'again')
		
		expect(spy.calls.count()).toEqual(2)
		expect(spy).toHaveBeenCalledWith('test','once')
		
	})
	

	
	//expect(emitter).toEqual(jasmine.any(events.EventEmitter));
	
});