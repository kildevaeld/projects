'use strict';

const Model = require('collection').Model;

describe('Model', function () {

  describe('instantiation', function () {

    it('should instantiate', function () {
      let model = new Model();
      expect(model).not.toBe(null);
      
    });

    it('should instantiate with values', function () {
      let data = {title:"Test", body: "test test"}
      let model = new Model(data);
      expect(model._attributes).toBe(data);

    });

    it('sould set a value', function () {
      let model = new Model();
      model.set('title', 'Test Title');
      expect(model._attributes.title).toEqual('Test Title');
    });

    it('should get a value', function () {
      let model = new Model({title:'test'});
      let val = model.get('title');
      expect(val).toEqual('test');
    })

  });


});
