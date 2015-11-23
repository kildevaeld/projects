var BaseView = views.BaseView


function setupHTMLFixtures() {
  setFixtures('<div id="region"></div>');
}

describe('BaseView', function () {
	
    var region;

  beforeEach(function () {
    if (region) region.destroy();
    setupHTMLFixtures()
    //body = document.getElementsByTagName('body')[0];
    region = Region.buildRegion('#region');
  });

  afterEach(function () {
    if (region) region.destroy();
  })

  
	
	 it('should set el and $el property', function() {
    var view = new BaseView();
  
    expect(view.el).not.toBe(null);
    expect(view.el).not.toBe(null);
    expect(view.$el).not.toBe(null);
  });
  
  it('should use event hash', function () {
    var spy = jasmine.createSpy();
    var view = new (BaseView.extend({
      events: {
        'click': spy
      }
    }));
    
    region.show(view);
    $(view.el).click();
    
    expect(spy.calls.count()).toBe(1)
    
    
  })

  //xit('should destroy');

  //describe('rendering', function() {


    

	
})