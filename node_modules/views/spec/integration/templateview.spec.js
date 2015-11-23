

var TemplateView = views.TemplateView
describe('TemplateView', function () {

  it('should be instanceof view', function () {
    var view = new TemplateView();
    expect(view).toEqual(jasmine.any(views.View));
  });

  xit('should render', function () {
    var view = new TemplateView();
    view.render();
    expect(view._isRendered).toBe(true);
    expect(view.el.innerHTML).toEqual('');

  });

  it('should emit before:render event', function () {
    var view = new (TemplateView.extend({
      onBeforeRender: jasmine.createSpy('onBeforeRender')
    }));

    var spy = jasmine.createSpy('before:render');
    view.on('before:render', spy);
    view.render();

    expect(spy.calls.count()).toEqual(1, 'before:render');
    expect(view.onBeforeRender.calls.count()).toEqual(1, 'onBeforeRender');
  });

  it('should emit render event', function () {
    var view = new (TemplateView.extend({
      onRender: jasmine.createSpy('onRender')
    }));
    var spy = jasmine.createSpy('render');
    view.on('render', spy);
    
    view.render();
    
    expect(spy.calls.count()).toEqual(1, 'render');
    expect(view.onRender.calls.count()).toEqual(1, 'onRender');
  });

  it('should render template string', function () {
    var view = new TemplateView({
      template: 'Hello, World!'
    });

    view.render();
    expect(view.el.innerHTML).toBe('Hello, World!');
   
  });

  it('should render template function', function () {
    var view = new TemplateView({
      template: function (data) {
        return "Hello, World!";
      }
    });

    view.render();
    expect(view.el.innerHTML).toBe('Hello, World!');
    
  });

  xit('should render template function with model data', function (done) {
    var view = new TemplateView({
      template: function (data) {
        return "Hello, " + data.who + '!';
      },
      model: new JaffaMVC.Model({
        who: 'You'
      })
    });

    view.render();

    view.on('render', function () {
      expect(view.el.innerHTML).toBe('Hello, You!');
      done();
    });

  });

  xit('should render template function which returns a promise', function (done) {
    var view = new JaffaMVC.View({
      template: function (data) {
        return new Promise(function (resolve, reject) {
          return resolve('Hello, World!');
        });
      }
    });

    view.render();

    view.on('render', function () {
      expect(view.el.innerHTML).toBe('Hello, World!');
      done();
    });
  });

  xit('should render template function with node style callback', function (done) {
    var view = new JaffaMVC.View({
      template: function (data, done) {
        done(null, 'Hello, World!');
      }
    });

    view.render();

    view.on('render', function () {
      expect(view.el.innerHTML).toBe('Hello, World!');
      done();
    });
  });

  xit('should render template function with generator', function (done) {
    var view = new JaffaMVC.View({
      template: function (data) {
        return 'Hello, World!';
      }
    });

    view.render();

    view.on('render', function () {
      expect(view.el.innerHTML).toBe('Hello, World!');
      done();
    });
  });

})