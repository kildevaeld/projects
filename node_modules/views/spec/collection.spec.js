'use strict';

const Collection = require('collection').Collection,
	Model = require('collection').Model;
  //BaseObject = require('../lib/object').BaseObject;

let TestModel = Model.extend({
	idAttribute: 'id'
});

describe('Collection', function () {

	var data = {title: 'miav', id:1 }

  describe('instantiation', function () {

    it('should instantiate', function () {
      let collection = new Collection();
      expect(collection).not.toBe(null);
      //expect(collection).toEqual(jasmine.any(BaseObject));

    });

    it('should instantiate with array of objects', function () {
    
      let collection = new Collection([data]);
      expect(collection.length).toBe(1);
			expect(collection.models[0]).toEqual(jasmine.any(Model))
			expect(collection.models[0].toJSON()).toEqual(data)

    });
		
		it('should instantiate with array of models', function () {
      let data = [new TestModel({title:'miav', id:'1'})]
      let collection = new Collection(data);
      expect(collection.length).toBe(1);
			expect(collection.models[0]).toEqual(jasmine.any(TestModel))
			expect(collection.models[0]).toBe(data[0])

    });

		it('should add an object', function () {
			
			let collection = new Collection()
      
      collection.add(data)
      
      expect(collection.length).toBe(1)
      let first = collection.models[0]
      expect(first).toEqual(jasmine.any(Model))
      expect(first.toJSON()).toEqual(data)
      
		});
    
    it('should add a model', function () {
			
			let collection = new Collection()
      let model = new TestModel(data)
      collection.add(model)
      
      expect(collection.length).toBe(1)
      let first = collection.models[0]
      expect(first).toEqual(jasmine.any(TestModel))
      expect(first).toBe(model)
      
      expect(first.toJSON()).toEqual(data)
      
		})
    
    it('should not add a duplicate model', function () {
			
			let collection = new Collection()
      let model = new TestModel(data)
      
      collection.add(model)
      collection.add(model) 
      expect(collection.length).toBe(1)
     
      
		})
    
     
     it('should trigger add event', function () {
       let spy = jasmine.createSpy('add')
      
       let collection = new Collection([], {})
       let model = new TestModel(data)
      
       collection.on('add', spy)
       collection.add(model)
       expect(spy.calls.count()).toBe(1) 
     })

  });


});
