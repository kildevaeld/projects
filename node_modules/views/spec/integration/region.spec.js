var Region = views.Region
var View = views.View

function setupHTMLFixtures() {
  setFixtures('<div id="region"></div>');
}

describe('Region', function() {

  beforeEach(function() {
    
    setupHTMLFixtures();
    
  })

  describe('instantiation', function() {
    it('should create region by selector', function() {
      var region = Region.buildRegion('#region');

      var el = document.getElementById("region");

      expect(region).toEqual(jasmine.any(Region))
      expect(region.el).toEqual(el);
    });

    it('should instantiate region by object', function() {
      var region = Region.buildRegion({
        selector: '#region',
        regionClass: Region
      });

      var el = document.getElementById('region');

      expect(region).toEqual(jasmine.any(Region));
      expect(region.el).toBe(el);
    });
  });

  describe('show view', function() {
    var region;
    beforeEach(function() {
      region = Region.buildRegion('#region');
    });

    xit('should show view', function() {
      var view = new View();

      region.show(view);
      
      expect(region.view).toEqual(view);
      expect(region.el.firstChild).toEqual(view.el);
      expect(region.el.children.length).toBe(1);
      //expect(view._isShown).toBe(true);
    });

    xit('should render view', function() {

      var view = new View();

      region.show(view);

      //expect(view._isRendered).toBe(true);

    });

    xit('should trigger show on view', function () {

      var beforeShow = jasmine.createSpy('before:show')
      var show = jasmine.createSpy('show');

      var view = new View();

      view.once('before:show', beforeShow);
      view.once('show', show);

      region.show(view);

      expect(show).toHaveBeenCalled();
      expect(beforeShow).toHaveBeenCalled();
    });
  });

  describe('empty view', function() {

    var region, view;
    beforeEach(function() {
      region = Region.buildRegion('#region');
      view = new View();
      region.show(view);
    });

    it('should empty region', function() {
      region.empty();

      expect(region.el.children.length).toBe(0);
      expect(region.currentView).toBe(undefined);
    });

    it('should destroy currentview', function () {
      region.empty();
      expect(view.isDestroyed).toBe(true);
    });

    it('should trigger empty events on region', function() {
      var beforeSpy = jasmine.createSpy('before:empty');
      var spy = jasmine.createSpy('empty');

      region.once('before:empty',beforeSpy);
      region.once('empty', spy)

      region.empty();

      expect(beforeSpy.calls.count()).toEqual(1);
      expect(spy.calls.count()).toEqual(1);

    });

    it('should swap view', function() {
      var nview = new View();

      region.show(nview);

      expect(view.isDestroyed).toEqual(true);
      expect(region.view).toEqual(nview);
      expect(region.el.children.length).toEqual(1);
      expect(region.el.firstChild).toEqual(nview.el);
    });

  });




});
